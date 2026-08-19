import React, { useContext, useState, useEffect } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Contact, Mail, Pen, Eye, ExternalLink, Download, Loader2, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import ActivityHeatmap from "./ActivityHeatmap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/Hooks/useGetAppliedJobs";
import { LoadingBarContext } from "./LoadingBarContext";
import { USER_API_END_POINT } from "@/utils/constant";

const Profile = () => {
  useGetAppliedJobs();
  const loadingBarRef = useContext(LoadingBarContext);

  useEffect(() => {
    if (loadingBarRef?.current) {
      loadingBarRef.current.continuousStart();
      loadingBarRef.current.complete();
    }
  }, []);
  const [open, setOpen] = useState(false);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const { user } = useSelector((store) => store.auth);
  const { allAppliedJobs } = useSelector((store) => store.job);

  const getStreamResumeUrl = (url, originalName, isDownload = false) => {
    if (!url) return "";
    const filename = originalName || "Resume.pdf";
    return `${USER_API_END_POINT}/resume/stream?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}${isDownload ? "&download=true" : ""}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 my-8">
      <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <AvatarImage
                src={user?.profile?.profilePhoto}
                alt="profile"
                className="object-cover rounded-2xl"
              />
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {user?.fullname}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                {user?.profile?.bio || "No bio added yet. Click edit to add your professional summary."}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="p-2.5 h-auto rounded-xl border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 self-end sm:self-auto cursor-pointer shadow-sm transition-all"
            title="Edit Profile"
          >
            <Pen className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4 text-purple-600" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <Contact className="w-4 h-4 text-purple-600" />
            <span>{user?.phoneNumber || "No phone number added"}</span>
          </div>
        </div>

        <div className="space-y-2 my-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Technical Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {user?.profile?.skills?.length > 0 ? (
              user?.profile?.skills.map((item, index) => (
                <Badge
                  key={index}
                  className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 px-3 py-1 rounded-xl text-xs font-semibold"
                >
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400">No skills listed yet</span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Resume Document</h2>
          {user?.profile?.resume ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setPdfLoading(true);
                  setResumePreviewOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200/80 dark:border-purple-800/80 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Resume
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={getStreamResumeUrl(user?.profile?.resume, user?.profile?.resumeOriginalName, false)}
                className="text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3 h-3" /> Open in New Tab
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-400">No resume uploaded</span>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-900 shadow-sm transition-all duration-200 cursor-pointer"
              >
                + Upload Resume
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GitHub-Style 52-Week Application Activity Heatmap */}
      <ActivityHeatmap appliedJobs={allAppliedJobs} />

      {/* Applied Jobs Table Container */}
      <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Applied Jobs</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track your job applications and recruitment progress</p>
          </div>
        </div>
        <AppliedJobTable />
      </div>

      {/* Edit Profile Modal */}
      <UpdateProfileDialog open={open} setOpen={setOpen} />

      {/* Resume PDF In-Browser Preview Modal */}
      <Dialog open={resumePreviewOpen} onOpenChange={setResumePreviewOpen}>
        <DialogContent className="!max-w-5xl w-[96vw] sm:w-[94vw] h-[85vh] sm:h-[88vh] max-h-[90vh] rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
          <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pr-8">
            <DialogTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
              📄 {user?.profile?.resumeOriginalName || "Resume Preview"}
            </DialogTitle>
            <button
              onClick={() => {
                const streamUrl = getStreamResumeUrl(user?.profile?.resume, user?.profile?.resumeOriginalName, false);
                if (streamUrl) window.open(streamUrl, "_blank");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-800 shadow-sm transition-all duration-200 cursor-pointer shrink-0 ml-2"
              title="Open full screen in a new tab"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
            </button>
          </DialogHeader>
          <div className="relative flex-1 w-full h-[calc(88vh-70px)] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            {pdfLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm space-y-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Loading Resume Preview...
                </p>
              </div>
            )}
            {user?.profile?.resume && (
              <iframe
                src={`${getStreamResumeUrl(user.profile.resume, user.profile.resumeOriginalName)}#toolbar=1&view=FitH`}
                title="Resume Previewer"
                onLoad={() => setPdfLoading(false)}
                className="w-full h-full border-none rounded-xl"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
