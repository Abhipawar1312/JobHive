import React from "react";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { Briefcase, SearchX, Loader2 } from "lucide-react";
import { JobCardSkeleton } from "./shared/SkeletonLoader";

const Jobs = () => {
  useGetAllSavedJobs();
  const { loading } = useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);

  const displayJobs = allJobs || [];

  return (
    <div className="px-4 mx-auto mt-6 max-w-7xl">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Filter Card Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <FilterCard />
        </div>

        {/* Job Listings Area */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Available Jobs ({displayJobs.length})
            </h2>
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating listings...
              </span>
            )}
          </div>

          {loading && (!displayJobs || displayJobs.length === 0) ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          ) : displayJobs.length <= 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
              <SearchX className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No matching jobs found</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Try adjusting your filters, location, or search keywords to find relevant job openings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {displayJobs.map((job) => (
                  <motion.div
                    key={job._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Job job={job} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
