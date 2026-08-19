import React, { useContext, useEffect } from "react";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import { motion } from "framer-motion";
import { Search, Briefcase, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Browse = () => {
  useGetAllJobs();
  useGetAllSavedJobs();
  const { allJobs } = useSelector((store) => store.job);

  const loadingBarRef = useContext(LoadingBarContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loadingBarRef?.current) {
      loadingBarRef.current.continuousStart();
      loadingBarRef.current.complete();
    }
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  return (
    <div className="px-4 mx-auto my-8 max-w-7xl">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Search Results ({allJobs.length})
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Showing all matching job vacancies and career opportunities.
              </p>
            </div>
          </div>

          <Link to="/jobs">
            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Filter All Jobs
            </Button>
          </Link>
        </div>
      </div>

      {allJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-xl max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-900 shadow-sm">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Jobs Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5 leading-relaxed">
            Try adjusting your search terms or exploring all available listings.
          </p>
          <Link to="/jobs">
            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs h-10 px-6 rounded-xl font-bold shadow-md shadow-purple-500/20">
              Browse All Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
        >
          {allJobs.map((job) => (
            <Job key={job._id} job={job} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Browse;
