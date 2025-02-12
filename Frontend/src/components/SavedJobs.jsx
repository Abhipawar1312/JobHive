import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import React from "react";
import { useSelector } from "react-redux";
import Job from "./Job";
import { motion } from "framer-motion";

const SavedJobs = () => {
  useGetAllSavedJobs();
  const { allSavedJobs } = useSelector((store) => store.savedJobs);

  // Fallback to empty array if allSavedJobs is undefined
  const savedJobs = allSavedJobs || [];


  return (
    <div className="px-4">
      <div className="mx-auto my-10 max-w-7xl">
        <h1 className="my-10 text-xl font-bold">
          Search Results ({savedJobs.length})
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
        >
          {savedJobs.map((savedJob) => {
            // Pass the nested job object to the Job component
            return <Job key={savedJob.job._id} job={savedJob.job} />;
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedJobs;
