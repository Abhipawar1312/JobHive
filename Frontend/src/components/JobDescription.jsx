import React, { useContext, useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "./redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { User } from "lucide-react";
import { LoadingBarContext } from "./LoadingBarContext";
import MDEditor from "@uiw/react-md-editor";

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
  const loadingBarRef = useContext(LoadingBarContext);

  const applyJobHandler = async () => {
    try {
      loadingBarRef.current.continuousStart();
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      loadingBarRef.current.complete();
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        loadingBarRef.current.continuousStart();
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
        console.error("Axios error:", error);
      } finally {
        loadingBarRef.current.complete();
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?.id]);

  return (
    <div className="px-4 mx-auto my-10 max-w-7xl">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {singleJob?.company?.name}
          </h1>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-1">
            {singleJob?.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className="font-bold text-blue-700" variant="ghost">
              {singleJob?.position} Positions
            </Badge>
            <Badge className="font-bold text-red-600" variant="ghost">
              {singleJob?.jobType}
            </Badge>
            <Badge className="font-bold text-purple-700" variant="ghost">
              {singleJob?.salary} LPA
            </Badge>
          </div>
        </div>
        <Button
          onClick={isApplied ? null : applyJobHandler}
          disabled={isApplied}
          className={`rounded-lg px-6 py-2 transition-colors duration-200 ${
            isApplied
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-600"
          }`}
        >
          {isApplied ? "Already Applied" : "Apply Now"}
        </Button>
      </div>

      <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-8 border-b border-gray-300 dark:border-gray-700 pb-2">
        Job Description
      </h3>

      {/* Job Details */}
      <div className="mt-6 space-y-4 text-gray-800 dark:text-gray-200">
        {/* Role */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Role: </span>
          {singleJob?.title}
        </p>
        {/* Location */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Location: </span>
          {singleJob?.location}
        </p>
        {/* Description */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Description: </span>
          {singleJob?.description}
        </p>

        {/* Requirements - Markdown */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Requirements: </span>
          <MDEditor.Markdown
            source={singleJob?.requirements}
            className="bg-transparent sm:text-lg md-editor-container"
          />
        </p>

        {/* Experience */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Experience: </span>
          {singleJob?.experienceLevel} yrs
        </p>
        {/* Salary */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Salary: </span>
          {singleJob?.salary} LPA
        </p>
        {/* Total Applicants */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Total Applicants: </span>
          {singleJob?.applications?.length}
        </p>
        {/* Posted Date */}
        <p className="text-base md:text-lg leading-relaxed">
          <span className="font-semibold">Posted Date: </span>
          {singleJob?.createdAt?.split("T")[0]}
        </p>
      </div>
    </div>
  );
};

export default JobDescription;
