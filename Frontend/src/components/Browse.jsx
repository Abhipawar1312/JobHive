import React, { useContext, useEffect } from "react";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import { motion } from "framer-motion";

const randomJobs = [1, 2, 3, 4, 5, 6];
const Browse = () => {
  useGetAllJobs();
  useGetAllSavedJobs();
  const { allJobs } = useSelector((store) => store.job);
  console.log(allJobs, "allJobs");
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
    <div>
      <div className="mx-auto my-10 max-w-7xl">
        <h1 className="my-10 text-xl font-bold">
          Search Results ({allJobs.length})
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 100 }} // starts 100px below its final position
          animate={{ opacity: 1, y: 0 }} // animates to its natural position
          exit={{ opacity: 0, y: -100 }} // exits by moving 100px above its position
          transition={{ duration: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          {allJobs.map((job) => {
            return <Job key={job._id} job={job} />;
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Browse;
