import React, { useEffect, useState } from "react";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetAllSavedJobs from "@/Hooks/useGetAllSavedJobs";
import useGetAllJobs from "@/Hooks/useGetAllJobs";

const Jobs = () => {
  useGetAllSavedJobs();
  useGetAllJobs();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);

  useEffect(() => {
    let filteredJobs = allJobs;
    // If a query exists, filter by text fields.
    if (searchedQuery?.query) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchedQuery.query.toLowerCase()) ||
          job.description
            .toLowerCase()
            .includes(searchedQuery.query.toLowerCase()) ||
          job.location.toLowerCase().includes(searchedQuery.query.toLowerCase())
      );
    }

    // If a salary range is provided, further filter by salary.
    if (searchedQuery?.salaryRange) {
      const { min, max } = searchedQuery.salaryRange;
      filteredJobs = filteredJobs.filter((job) => {
        // Assuming job.salary is in lakhs; convert to rupees.
        const salaryInRupees = job.salary * 100000;
        return salaryInRupees >= min && salaryInRupees <= max;
      });
    }

    setFilterJobs(filteredJobs);
  }, [allJobs, searchedQuery]);

  return (
    <div className="px-4 mx-auto mt-5 max-w-7xl">
      <div className="flex flex-col gap-5 md:flex-row">
        {/* Filter card becomes full width on mobile and 1/4 width on md+ */}
        <div className="w-full md:w-1/4">
          <FilterCard />
        </div>
        {filterJobs.length <= 0 ? (
          <span className="w-full text-center">Job Not Found</span>
        ) : (
          <div className="flex-1 h-auto md:h-[80vh] overflow-y-auto pb-1">
            {/* Responsive grid: 1 column on extra-small, 2 on small, 3 on medium, 4 on large */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {filterJobs.map((job) => (
                <motion.div
                  key={job._id}
                  className="p-1"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Job job={job} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
