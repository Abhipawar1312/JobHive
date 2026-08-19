import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { SAVEDJOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addSavedJob, removeSavedJob } from "./redux/savedJobSlice";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if this job is already saved
  const savedJobs = useSelector((store) => store.savedJobs.allSavedJobs) || [];
  const isSaved = savedJobs.some((savedJob) => savedJob.job._id === job._id);

  const [loading, setLoading] = useState(false);

  // Calculate the number of days ago since the job was created.
  const daysAgoFunction = (mongoDBTime) => {
    const createdAt = new Date(mongoDBTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (!isSaved) {
        const response = await axios.post(
          `${SAVEDJOB_API_END_POINT}/save`,
          { jobId: job._id },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          dispatch(addSavedJob({ job }));
        }
      } else {
        const response = await axios.delete(
          `${SAVEDJOB_API_END_POINT}/unsave/${job._id}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          dispatch(removeSavedJob(job._id));
        }
      }
    } catch (error) {
      console.error("Error toggling saved job:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
    setLoading(false);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    navigate(`/description/${job?._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-6 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-500/40 dark:hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 flex flex-col h-full"
    >
      {/* Top Section: Company Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {job?.company?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {job?.location}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {daysAgoFunction(job?.createdAt) === 0
              ? "Today"
              : `${daysAgoFunction(job?.createdAt)} days ago`}
          </p>
        </div>
        {/* Company Logo */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </div>
      </div>

      {/* Middle Section: Title & Description */}
      <div className="mb-4 flex-grow">
        <h1 className="text-lg font-bold text-[#6A38C2] dark:text-purple-400 mb-1.5 line-clamp-1">
          {job?.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
          {job?.description}
        </p>
      </div>

      {/* Bottom Section: Badges & Actions */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
          >
            {job?.position} Positions
          </Badge>
          <Badge
            className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
          >
            {job?.jobType}
          </Badge>
          <Badge
            className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
          >
            {job?.salary} LPA
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={handleDetailsClick}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-[#6A38C2] hover:text-white dark:hover:bg-[#6A38C2] dark:hover:text-white hover:border-[#6A38C2] transition-all duration-200 shadow-sm cursor-pointer"
          >
            Details
          </button>
          <button
            onClick={handleSaveToggle}
            disabled={loading}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm cursor-pointer ${
              isSaved
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : "bg-[#6A38C2] hover:bg-[#5b30a6] text-white hover:shadow-purple-500/20"
            }`}
          >
            {loading ? "Loading..." : isSaved ? "Unsave Job" : "Save For Later"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Job;
