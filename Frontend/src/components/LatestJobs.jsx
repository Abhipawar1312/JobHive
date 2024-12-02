import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className="mx-auto my-20 lg:max-w-7xl">
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
    </div>
  );
};

export default LatestJobs;
