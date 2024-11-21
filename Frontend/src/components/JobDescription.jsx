import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "./redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { User } from "lucide-react";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const isInitiallyApplied = singleJob?.applications?.some(
    (application) => application.applicant === user?._id || false
  );
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);

  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        { withCredentials: true }
      );
      console.log(res.data);
      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: User?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications.some(
              (application) => application.applicant === user?._id
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?.id]);
  return (
    <>
      <Navbar />
      <div className="mx-auto my-10 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{singleJob?.title}</h1>
            <div className="flex items-center gap-2 mt-4">
              <Badge className={"text-blue-700 font-bold"} variant="ghost">
                {singleJob?.position} Positions
              </Badge>
              <Badge className={"text-[#F83002] font-bold"} variant="ghost">
                {singleJob?.jobType}
              </Badge>
              <Badge className={"text-[#7209B7] font-bold"} variant="ghost">
                {singleJob?.salary} LPA
              </Badge>
            </div>
          </div>
          <Button
            onClick={isApplied ? null : applyJobHandler}
            disabled={isApplied}
            className={`rounded-lg ${
              isApplied
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#7209b7] hover:bg-[#5f32ad]"
            }`}
          >
            {isApplied ? "Already applied" : "Apply Now"}
          </Button>
        </div>
        <h1 className="py-4 font-medium border-b-2 border-b-gray-300">
          Job Description
        </h1>
        <div className="my-4">
          <h1 className="my-1 font-bold">
            Role:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {singleJob?.title}
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Location:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {singleJob?.location}
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Description:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {singleJob?.description}
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Experience:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {singleJob?.experienceLevel} yrs
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Salary:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {singleJob?.salary} LPA
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Total Applicants:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {" "}
              {singleJob?.applications?.length}
            </span>
          </h1>
          <h1 className="my-1 font-bold">
            Posted Date:{" "}
            <span className="pl-4 font-normal text-gray-800 dark:text-white">
              {" "}
              {singleJob?.createdAt.split("T")[0]}
            </span>
          </h1>
        </div>
      </div>
    </>
  );
};

export default JobDescription;
