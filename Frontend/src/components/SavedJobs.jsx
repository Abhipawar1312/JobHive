import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import React from "react";
import { useSelector } from "react-redux";
import Job from "./Job";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, SearchX, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const SavedJobs = () => {
  useGetAllSavedJobs();
  const { allSavedJobs } = useSelector((store) => store.savedJobs);
  const savedJobs = allSavedJobs || [];

  return (
    <div className="px-4 mx-auto my-8 max-w-7xl">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Saved Jobs ({savedJobs.length})
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Review, manage, and apply to job opportunities you have bookmarked.
              </p>
            </div>
          </div>

          <Link to="/jobs">
            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Explore More Jobs
            </Button>
          </Link>
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-xl max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-900 shadow-sm">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Saved Jobs Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5 leading-relaxed">
            Click the bookmark icon on any job card to save listings here for later application.
          </p>
          <Link to="/jobs">
            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs h-10 px-6 rounded-xl font-bold shadow-md shadow-purple-500/20">
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {savedJobs.map((savedJob) => (
              <motion.div
                key={savedJob._id || savedJob.job?._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {savedJob.job && <Job job={savedJob.job} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default SavedJobs;
