// Job.js
import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
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

  // Derive isSaved from the global savedJobs state
  const savedJobs = useSelector((store) => store.savedJobs.allSavedJobs) || [];
  const isSaved = savedJobs.some((savedJob) => savedJob.job._id === job._id);

  const [loading, setLoading] = useState(false);

  // Function to calculate days ago from MongoDB's createdAt timestamp
  const daysAgoFunction = (mongoDBTime) => {
    const createdAt = new Date(mongoDBTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  };

  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      if (!isSaved) {
        // Save job API call
        const response = await axios.post(
          `${SAVEDJOB_API_END_POINT}/save`,
          { jobId: job._id },
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          // Update global state: add the job to saved jobs
          dispatch(addSavedJob({ job }));
        }
      } else {
        // Unsave job API call
        const response = await axios.delete(
          `${SAVEDJOB_API_END_POINT}/unsave/${job._id}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          // Update global state: remove the job from saved jobs
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

  return (
    <div className="p-5 border border-gray-100 rounded-md h-[400px] shadow-xl flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-white">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        {/* <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark />
        </Button> */}
      </div>
      <div className="flex items-center gap-2 my-2">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className="text-lg font-medium">{job?.company?.name}</h1>
          <p className="text-sm text-gray-500">{job?.location}</p>
        </div>
      </div>
      <div className="flex-grow">
        <h1 className="my-2 text-lg font-bold line-clamp-1">{job?.title}</h1>
        <p className="text-sm text-gray-600 line-clamp-5 dark:text-white">
          {job?.description}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Badge className="font-bold text-blue-700" variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className="text-[#F83002] font-bold" variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className="text-[#7209B7] font-bold" variant="ghost">
          {job?.salary} LPA
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
        >
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
  );
};

export default Job;
