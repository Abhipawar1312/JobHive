import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);

  useEffect(() => {
    let filteredJobs = allJobs;
    console.log(filterJobs);

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
      console.log(filterJobs, "filterJobs");
    }

    // If a salary range is provided, further filter by salary.
    if (searchedQuery?.salaryRange) {
      const { min, max } = searchedQuery.salaryRange;
      filteredJobs = filteredJobs.filter((job) => {
        // Here we assume that job.salary is given in lakhs.
        // Multiply by 100000 to convert it to rupees.
        const salaryInRupees = job.salary * 100000;
        return salaryInRupees >= min && salaryInRupees <= max;
      });
    }

    setFilterJobs(filteredJobs);
  }, [allJobs, searchedQuery]);

  return (
    <div>
      <Navbar />
      <div className="mx-auto mt-5 max-w-7xl">
        <div className="flex gap-5">
          <div className="w-20%">
            <FilterCard />
          </div>
          {filterJobs.length <= 0 ? (
            <span>Job Not Found</span>
          ) : (
            <div className="flex-1 h-[80vh] overflow-y-auto pb-1">
              <div className="grid grid-cols-3 gap-1">
                {filterJobs.map((job) => (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    key={job._id}
                    className="p-1"
                  >
                    <Job job={job} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
