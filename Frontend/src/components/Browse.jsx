import React, { useContext, useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { LoadingBarContext } from "./LoadingBarContext";

const randomJobs = [1, 2, 3, 4, 5, 6];
const Browse = () => {
  useGetAllJobs();
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
    <div>
      <Navbar />
      <div className="mx-auto my-10 max-w-7xl">
        <h1 className="my-10 text-xl font-bold">
          Search Results ({allJobs.length})
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {allJobs.map((job) => {
            return <Job key={job._id} job={job} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Browse;
