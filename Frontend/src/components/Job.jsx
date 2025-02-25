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
      className="p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl 
                 transition-all duration-300 cursor-pointer bg-white 
                 dark:bg-gray-800 hover:border-blue-200 flex flex-col h-full"
    >
      {/* Top Section: Company Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
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
          <p className="text-xs text-gray-400 mt-1">
            {daysAgoFunction(job?.createdAt) === 0
              ? "Today"
              : `${daysAgoFunction(job?.createdAt)} days ago`}
          </p>
        </div>
        {/* Company Logo */}
        <Button
          onClick={(e) => e.stopPropagation()}
          className="p-2"
          variant="outline"
          size="icon"
        >
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
      </div>

      {/* Middle Section: Title & Description */}
      <div className="mb-4 flex-grow">
        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 line-clamp-1">
          {job?.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {job?.description}
        </p>
      </div>

      {/* Bottom Section: Badges & Actions */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
            variant="secondary"
          >
            {job?.position} Positions
          </Badge>
          <Badge
            className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
            variant="secondary"
          >
            {job?.jobType}
          </Badge>
          <Badge
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
            variant="secondary"
          >
            {job?.salary} LPA
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Button onClick={handleDetailsClick} variant="outline">
            Details
          </Button>
          <Button
            onClick={handleSaveToggle}
            className={`${isSaved ? "bg-red-500" : "bg-[#7209B7]"} text-white`}
            disabled={loading}
          >
            {loading ? "Loading..." : isSaved ? "Unsave Job" : "Save For Later"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Job;
