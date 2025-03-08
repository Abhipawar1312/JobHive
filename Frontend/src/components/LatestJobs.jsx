import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className="px-4 mx-auto my-20 lg:max-w-7xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-6 text-3xl font-bold md:text-4xl"
      >
        <motion.span
          initial={{ color: "#000" }}
          animate={{ color: "#6A49C2" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[#6A49C2]"
        >
          Latest & Top
        </motion.span>{" "}
        Job Openings
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {allJobs.length <= 0 ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            No Job Available
          </motion.span>
        ) : (
          allJobs.slice(0, 6).map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <LatestJobCards job={job} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default LatestJobs;
