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
    console.log("useEffect triggered, jobId:", jobId, "user id:", user?.id);
    const fetchSingleJob = async () => {
      try {
        console.log("Starting axios request");
        loadingBarRef.current.continuousStart();
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        console.log("Axios response received:", res.data);
        if (res.data.success) {
          console.log("Job data:", res.data.job);
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
          <h1 className="text-xl font-bold">{singleJob?.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className="font-bold text-blue-700" variant="ghost">
              {singleJob?.position} Positions
            </Badge>
            <Badge className="text-[#F83002] font-bold" variant="ghost">
              {singleJob?.jobType}
            </Badge>
            <Badge className="text-[#7209B7] font-bold" variant="ghost">
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
      <div className="my-4 space-y-3">
        <h1 className="font-bold">
          Role:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.title}
          </span>
        </h1>
        <h1 className="font-bold">
          Location:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.location}
          </span>
        </h1>
        <h1 className="font-bold">
          Description:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.description}
          </span>
        </h1>
        {/* <h1 className="font-bold">
          Requirements:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.requirements?.join(", ")}
          </span>
        </h1> */}
        <MDEditor.Markdown
          source={singleJob?.requirements}
          className="bg-transparent sm:text-lg md-editor-container" // add global ul styles - tutorial
        />
        <h1 className="font-bold">
          Experience:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.experienceLevel} yrs
          </span>
        </h1>
        <h1 className="font-bold">
          Salary:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.salary} LPA
          </span>
        </h1>
        <h1 className="font-bold">
          Total Applicants:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.applications?.length}
          </span>
        </h1>
        <h1 className="font-bold">
          Posted Date:{" "}
          <span className="pl-4 font-normal text-gray-800 dark:text-white">
            {singleJob?.createdAt?.split("T")[0]}
          </span>
        </h1>
      </div>
    </div>
  );
};

export default JobDescription;
