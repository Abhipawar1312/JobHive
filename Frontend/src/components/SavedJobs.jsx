import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import React from "react";
import { useSelector } from "react-redux";
import Job from "./Job";

const SavedJobs = () => {
  useGetAllSavedJobs();
  const { allSavedJobs } = useSelector((store) => store.savedJobs);

  // Fallback to empty array if allSavedJobs is undefined
  const savedJobs = allSavedJobs || [];

  console.log(savedJobs);

  return (
    <div>
      <div className="mx-auto my-10 max-w-7xl">
        <h1 className="my-10 text-xl font-bold">
          Search Results ({savedJobs.length})
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {savedJobs.map((savedJob) => {
            // Pass the nested job object to the Job component
            return <Job key={savedJob.job._id} job={savedJob.job} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
