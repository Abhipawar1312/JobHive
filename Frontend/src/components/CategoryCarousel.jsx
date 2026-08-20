import React, { useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "./redux/jobSlice";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { Briefcase, Sparkles } from "lucide-react";

const CategoryCarousel = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);

  const searchJobHandler = (query) => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    dispatch(setSearchedQuery(query));
    navigate("/browse");
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  };

  // Only extract unique titles of currently active/open jobs in the database
  const liveCategories = useMemo(() => {
    const map = new Map();
    (allJobs || [])
      .filter((job) => job.status !== "closed" && job.title)
      .forEach((job) => {
        const title = job.title.trim();
        const key = title.toLowerCase();
        if (!map.has(key)) {
          map.set(key, title);
        }
      });
    return Array.from(map.values());
  }, [allJobs]);

  // If no jobs exist in DB, don't show an empty bar
  if (liveCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Popular Roles:
        </span>
        {liveCategories.map((title, index) => (
          <button
            key={index}
            onClick={() => searchJobHandler(title)}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:border-[#6A38C2] hover:bg-purple-50/60 dark:hover:bg-purple-950/40 text-gray-700 dark:text-gray-200 hover:text-[#6A38C2] dark:hover:text-purple-300 shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Briefcase className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
