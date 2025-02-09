import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }} // starts 100px to the left of its final position
      animate={{ opacity: 1, x: 0 }} // animates to its natural position
      exit={{ opacity: 0, x: -100 }} // exits by moving back to the left
      transition={{ duration: 0.3 }}
      className="mx-auto my-20 lg:max-w-7xl"
    >
      <h1 className="text-4xl font-bold">
        {" "}
        <span className="text-[#6A49C2]">Latest & Top</span> Job Openings
      </h1>
      <div className="grid gap-4 my-5 mt-4 lg:grid-cols-3 md:grid-cols-2">
        {allJobs.length <= 0 ? (
          <span>No Job Available</span>
        ) : (
          allJobs
            .slice(0, 6)
            .map((job, index) => <LatestJobCards key={job._id} job={job} />)
        )}
      </div>
    </motion.div>
  );
};

export default LatestJobs;
