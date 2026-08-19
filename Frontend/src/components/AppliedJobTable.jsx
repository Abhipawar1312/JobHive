import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";
import { Calendar, Video, Eye, CheckCircle2, Clock, XCircle, ArrowRight, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useSocket } from "@/context/SocketContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STAGES = [
  { key: "pending", label: "Applied" },
  { key: "reviewing", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "accepted", label: "Offer / Accepted" }
];

const getStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center justify-center font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap border";
  switch (status?.toLowerCase()) {
    case "accepted":
      return <span className={`${baseClasses} bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800`}>OFFER ACCEPTED</span>;
    case "interview":
      return <span className={`${baseClasses} bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800`}>INTERVIEW SCHEDULED</span>;
    case "shortlisted":
      return <span className={`${baseClasses} bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800`}>SHORTLISTED</span>;
    case "reviewing":
      return <span className={`${baseClasses} bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800`}>IN REVIEW</span>;
    case "rejected":
      return <span className={`${baseClasses} bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800`}>NOT SELECTED</span>;
    default:
      return <span className={`${baseClasses} bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800`}>PENDING</span>;
  }
};

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  const { openChat } = useSocket();
  const [selectedApp, setSelectedApp] = useState(null);

  const getStageIndex = (status) => {
    const s = status?.toLowerCase();
    if (s === "rejected") return -1;
    return STAGES.findIndex(stage => stage.key === s);
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Table className="w-full">
        <TableCaption>A list of Your Applied Jobs & Live Progress</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Applied Date</TableHead>
            <TableHead className="whitespace-nowrap">Job Role</TableHead>
            <TableHead className="whitespace-nowrap">Company</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="text-right whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!allAppliedJobs || allAppliedJobs.length <= 0 ? (
            <TableRow>
              <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                You haven't applied for any jobs yet.
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <TableRow
                key={appliedJob._id}
                className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-purple-50/40 dark:hover:bg-purple-950/25 transition-colors duration-150"
              >
                <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                  {new Date(appliedJob?.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {appliedJob?.job?.title || "Job Title"}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {appliedJob?.job?.company?.name || "Company"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {getStatusBadge(appliedJob?.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {appliedJob?.job?.created_by && (
                      <button
                        onClick={() => openChat(appliedJob.job.created_by, appliedJob.job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/60 dark:border-blue-800/60 shadow-sm transition-all duration-200 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedApp(appliedJob)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200/60 dark:border-purple-800/60 shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Timeline
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Application Timeline & Interview Details Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="w-[94vw] sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Application Status & Timeline
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedApp?.job?.title} at {selectedApp?.job?.company?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 sm:space-y-6 pt-2">
              {/* Stepper Bar */}
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[280px]">
                  {STAGES.map((stage, idx) => {
                    const currentIndex = getStageIndex(selectedApp.status);
                    const isCompleted = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center flex-1 relative text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                            selectedApp.status === "rejected"
                              ? "bg-gray-200 text-gray-400"
                              : isCurrent
                              ? "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-950"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          }`}
                        >
                          {isCompleted && !isCurrent ? "✓" : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 font-medium ${
                            isCurrent
                              ? "text-purple-600 font-bold"
                              : isCompleted
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interview Invitation Card if Interview Scheduled */}
              {selectedApp.status === "interview" && selectedApp.interviewDetails && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 space-y-2">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600" /> Scheduled Interview
                  </h4>
                  {selectedApp.interviewDetails.date && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Date & Time: </strong> {new Date(selectedApp.interviewDetails.date).toLocaleString()}
                    </p>
                  )}
                  {selectedApp.interviewDetails.meetingUrl && (
                    <div className="pt-1">
                      <a
                        href={selectedApp.interviewDetails.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Video Interview
                      </a>
                    </div>
                  )}
                  {selectedApp.interviewDetails.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic pt-1">
                      "{selectedApp.interviewDetails.notes}"
                    </p>
                  )}
                </div>
              )}

              {/* Timeline Log History */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">Activity Log</h4>
                <div className="space-y-3 pl-2 border-l-2 border-purple-200 dark:border-purple-900">
                  {selectedApp.timeline && selectedApp.timeline.length > 0 ? (
                    selectedApp.timeline.map((item, idx) => (
                      <div key={idx} className="relative pl-4 text-xs">
                        <div className="absolute -left-[13px] top-0.5 w-2 h-2 rounded-full bg-purple-600" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100 uppercase text-[10px] tracking-wider">
                          {item.status}
                        </span>
                        <p className="text-gray-500 text-[11px]">{item.comment}</p>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.updatedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">Application submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Message Recruiter Button */}
              {selectedApp?.job?.created_by && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <Button
                    onClick={() => {
                      const rec = selectedApp.job.created_by;
                      const job = selectedApp.job;
                      setSelectedApp(null);
                      openChat(rec, job);
                    }}
                    className="text-xs bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Message Recruiter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppliedJobTable;
