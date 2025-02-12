import React, { useContext, useEffect } from "react";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import { motion } from "framer-motion";
import { all } from "axios";

const Browse = () => {
  useGetAllJobs();
  useGetAllSavedJobs();
  const { allJobs } = useSelector((store) => store.job);

  const loadingBarRef = useContext(LoadingBarContext);
  const dispatch = useDispatch();

  useEffect(() => {
    loadingBarRef.current.continuousStart();
    loadingBarRef.current.complete();
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  return (
    <div className="px-4">
      <div className="mx-auto my-10 max-w-7xl">
        <h1 className="my-10 text-xl font-bold">
          Search Results ({allJobs.length})
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
        >
          {allJobs.map((job) => (
            <Job key={job._id} job={job} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Browse;
