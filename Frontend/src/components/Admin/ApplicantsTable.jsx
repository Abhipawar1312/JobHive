import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  MoreHorizontal,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSocket } from "@/context/SocketContext";
import { calculateAtsMatchScore } from "@/utils/atsScorer";
import { Link } from "react-router-dom";

const ALL_STATUSES = [
  { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "reviewing", label: "In Review", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" },
  { key: "shortlisted", label: "Shortlisted", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  { key: "interview", label: "Interview", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300" },
  { key: "accepted", label: "Accepted", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { key: "rejected", label: "Rejected", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" },
];

const ApplicantsTable = ({ viewMode = "table", onStatusChanged }) => {
  const { applicants } = useSelector((store) => store.application);
  const { openChat } = useSocket();
  const [sortByAts, setSortByAts] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  const handleStatusChange = async (status, applicationId, customDetails = null) => {
    try {
      const payload = { status };
      if (customDetails) {
        payload.interviewDetails = customDetails;
      }

      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        if (onStatusChanged) onStatusChanged();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleOpenScheduleModal = (application) => {
    setSelectedApplication(application);
    setInterviewDate(application.interviewDetails?.date ? application.interviewDetails.date.substring(0, 16) : "");
    // Default meeting URL to in-app room if not specified
    const defaultRoomUrl = `${window.location.origin}/interview/jobhive-${application._id.substring(0, 8)}`;
    setMeetingUrl(application.interviewDetails?.meetingUrl || defaultRoomUrl);
    setInterviewNotes(application.interviewDetails?.notes || "");
    setScheduleModalOpen(true);
  };

  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate || !meetingUrl) {
      toast.error("Please provide both interview date/time and meeting link.");
      return;
    }

    try {
      setSavingSchedule(true);
      await handleStatusChange("interview", selectedApplication._id, {
        date: interviewDate,
        meetingUrl,
        notes: interviewNotes,
      });
      setScheduleModalOpen(false);
    } finally {
      setSavingSchedule(false);
    }
  };

  // Compute and optionally sort applications by ATS score
  let rawApplications = applicants?.applications ? [...applicants.applications] : [];
  
  // Attach calculated ATS Match object (Preferring Gemini AI score from DB if present)
  const applicationsWithAts = rawApplications.map((app) => {
    const dbAtsScore = app.atsScore;
    let atsMatch;
    if (typeof dbAtsScore === "number" && dbAtsScore > 0) {
      atsMatch = {
        score: dbAtsScore,
        label: dbAtsScore >= 80 ? "Top Match" : dbAtsScore >= 60 ? "Good Match" : "Low Match",
        badgeClass: dbAtsScore >= 80
          ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
          : dbAtsScore >= 60
          ? "text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
          : "text-rose-700 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800",
        dotColor: dbAtsScore >= 80 ? "bg-emerald-500" : dbAtsScore >= 60 ? "bg-amber-500" : "bg-rose-500",
        isGeminiAi: true,
      };
    } else {
      atsMatch = calculateAtsMatchScore(applicants, app.applicant);
    }

    return {
      ...app,
      atsMatch,
    };
  });

  const applications = sortByAts
    ? applicationsWithAts.sort((a, b) => b.atsMatch.score - a.atsMatch.score)
    : applicationsWithAts;

  // Header Toolbar with ATS Sort Toggle
  const renderToolbar = () => (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortByAts(!sortByAts)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            sortByAts
              ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-500"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {sortByAts ? "Sorted by AI ATS Score" : "Sort by AI ATS Match"}
        </button>
      </div>

      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        Total Applicants: <span className="font-bold text-gray-900 dark:text-white">{applications.length}</span>
      </span>
    </div>
  );

  if (viewMode === "kanban") {
    return (
      <div className="space-y-4">
        {renderToolbar()}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {ALL_STATUSES.map((column) => {
            const colApps = applications.filter(
              (app) => (app.status || "pending").toLowerCase() === column.key
            );

            return (
              <div
                key={column.key}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-3.5 flex flex-col min-h-[460px] shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b dark:border-gray-800">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${column.color}`}>
                    {column.label}
                  </span>
                  <span className="text-xs font-bold text-gray-500">{colApps.length}</span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colApps.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-8 italic">
                      No candidates
                    </div>
                  ) : (
                    colApps.map((item) => (
                      <div
                        key={item._id}
                        className="p-3.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 space-y-2.5 hover:shadow-md transition-all text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs truncate max-w-[125px]">
                              {item.applicant?.fullname}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate max-w-[125px]">
                              {item.applicant?.email}
                            </p>
                          </div>

                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-36 p-1 text-xs rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                              <p className="font-bold text-[10px] uppercase text-gray-400 px-2 py-1">Move to Stage</p>
                              {ALL_STATUSES.map((st) => (
                                <button
                                  key={st.key}
                                  onClick={() => {
                                    if (st.key === "interview") {
                                      handleOpenScheduleModal(item);
                                    } else {
                                      handleStatusChange(st.key, item._id);
                                    }
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 font-medium cursor-pointer"
                                >
                                  {st.label}
                                </button>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* AI ATS Match Score Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.atsMatch.badgeClass}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Match: {item.atsMatch.score}%
                          </span>
                        </div>

                        {/* Skills */}
                        {item.applicant?.profile?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.applicant.profile.skills.slice(0, 2).map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {item.applicant.profile.skills.length > 2 && (
                              <span className="text-[10px] text-gray-400">+{item.applicant.profile.skills.length - 2}</span>
                            )}
                          </div>
                        )}

                        {/* Interview Details if Scheduled */}
                        {item.status === "interview" && item.interviewDetails?.meetingUrl && (
                          <a
                            href={item.interviewDetails.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shadow-sm transition-all"
                          >
                            📹 Join Video Interview
                          </a>
                        )}

                        {/* Quick Actions */}
                        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                          {item.applicant?.profile?.resume ? (
                            <a
                              href={item.applicant.profile.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold text-[11px]"
                            >
                              <FileText className="w-3 h-3" /> Resume
                            </a>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No Resume</span>
                          )}

                          <button
                            onClick={() => openChat(item.applicant, applicants)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                            title="Message Candidate"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Interview Modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="w-[94vw] sm:max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-700 font-bold">
                <Calendar className="w-5 h-5 text-purple-600" /> Schedule Candidate Interview
              </DialogTitle>
              <DialogDescription className="text-xs">
                Candidate: {selectedApplication?.applicant?.fullname}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveInterview} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Interview Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="text-xs rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Meeting URL (In-App Video Room / Google Meet)</Label>
                <Input
                  type="url"
                  placeholder="https://jobhive.com/interview/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="text-xs rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Interview Notes / Instructions</Label>
                <Input
                  placeholder="e.g. Live coding round / portfolio review"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="text-xs rounded-xl h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={savingSchedule}
                className="w-full bg-[#6a38c2] hover:bg-[#5b30a6] text-white rounded-xl text-xs py-2.5 h-11 font-bold shadow-md shadow-purple-500/20"
              >
                {savingSchedule ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                  </div>
                ) : (
                  "Confirm & Notify Candidate via Email"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Table View
  return (
    <div className="space-y-4">
      {renderToolbar()}
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>AI ATS Score</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length <= 0 ? (
              <TableRow>
                <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                  No applicants found for this job listing.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((item) => (
                <TableRow key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                  <TableCell>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.applicant?.fullname}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.applicant?.profile?.skills?.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-1.5 py-0.2 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${item.atsMatch.badgeClass}`}>
                      <Sparkles className="w-3 h-3" />
                      {item.atsMatch.score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                    <div>{item.applicant?.email}</div>
                    <div className="text-gray-400">{item.applicant?.phoneNumber}</div>
                  </TableCell>
                  <TableCell>
                    {item.applicant?.profile?.resume ? (
                      <a
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-semibold"
                        href={item.applicant.profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Resume
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      ALL_STATUSES.find(s => s.key === (item.status || "pending").toLowerCase())?.color || ""
                    }`}>
                      {item.status || "pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "interview" && item.interviewDetails?.meetingUrl && (
                        <a
                          href={item.interviewDetails.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white rounded-lg transition-all"
                          title="Join Video Interview"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => openChat(item.applicant, applicants)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-lg transition-all duration-200 cursor-pointer"
                        title="Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40 p-1.5 text-xs rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <p className="font-bold text-[10px] uppercase text-gray-400 px-2 py-1">Update Status</p>
                          {ALL_STATUSES.map((statusObj) => (
                            <div
                              key={statusObj.key}
                              onClick={() => {
                                if (statusObj.key === "interview") {
                                  handleOpenScheduleModal(item);
                                } else {
                                  handleStatusChange(statusObj.key, item._id);
                                }
                              }}
                              className="flex items-center px-2 py-1.5 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 font-medium transition-colors"
                            >
                              <span>{statusObj.label}</span>
                            </div>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Schedule Interview Modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="w-[94vw] sm:max-w-md rounded-3xl p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-700 font-bold">
                <Calendar className="w-5 h-5 text-purple-600" /> Schedule Candidate Interview
              </DialogTitle>
              <DialogDescription className="text-xs">
                Candidate: {selectedApplication?.applicant?.fullname}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveInterview} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Interview Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="text-xs rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Meeting URL (In-App Video Room / Google Meet)</Label>
                <Input
                  type="url"
                  placeholder="https://jobhive.com/interview/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="text-xs rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Interview Notes / Instructions</Label>
                <Input
                  placeholder="e.g. Live coding round / portfolio review"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="text-xs rounded-xl h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={savingSchedule}
                className="w-full bg-[#6a38c2] hover:bg-[#5b30a6] text-white rounded-xl text-xs py-2.5 h-11 font-bold shadow-md shadow-purple-500/20"
              >
                {savingSchedule ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                  </div>
                ) : (
                  "Confirm & Notify Candidate via Email"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ApplicantsTable;
