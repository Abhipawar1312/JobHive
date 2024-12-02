import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PostJobs = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { jobId } = useParams(); // Grab jobId from URL
  const { companies } = useSelector((store) => store.company);

  const isEditMode = Boolean(jobId);
  // console.log(isEditMode);

  // Fetch job details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${JOB_API_END_POINT}/admin/jobs/${jobId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true, // if you need to send cookies along with the request
            }
          );
          // console.log(res);
          if (res.data.success) {
            // console.log(res.data);
            setInput({
              ...input,
              title: res.data.job.title,
              description: res.data.job.description,
              requirements: res.data.job.requirements.join(","),
              salary: res.data.job.salary,
              location: res.data.job.location,
              jobType: res.data.job.jobType,
              experience: res.data.job.experienceLevel,
              position: res.data.job.position,
              companyId: res.data.job.company._id,
            });
          } else {
            toast.error("Failed to fetch job details");
          }
        } catch (error) {
          toast.error(
            error.response.data.message || "Error fetching job details"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [jobId]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value
    );
    if (selectedCompany) {
      setInput({ ...input, companyId: selectedCompany._id });
    }
    // console.log("Selected Company ID:", selectedCompany?._id);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = isEditMode
        ? `${JOB_API_END_POINT}/update/${jobId}`
        : `${JOB_API_END_POINT}/post`;
      const method = isEditMode ? "put" : "post";
      const res = await axios[method](url, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // console.log(res.data);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5">
        <form
          onSubmit={submitHandler}
          className="max-w-4xl p-8 border border-gray-200 rounded-md shadow-lg"
        >
          <h2 className="text-xl font-bold text-center">
            {isEditMode ? "Update Job" : "Post New Job"}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                name="title"
                value={input.title}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type="text"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                type="text"
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>Experience Level</Label>
              <Input
                type="text"
                name="experience"
                value={input.experience}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div>
              <Label>No of Positions</Label>
              <Input
                type="number"
                name="position"
                value={input.position}
                onChange={changeEventHandler}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            {companies.length > 0 && (
              <Select
                onValueChange={selectChangeHandler}
                value={
                  companies
                    .find((c) => c._id === input.companyId)
                    ?.name?.toLowerCase() || ""
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company) => (
                      <SelectItem
                        key={company._id}
                        value={company?.name?.toLowerCase()}
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={companies.length === 0}
              className="w-full my-4"
            >
              {isEditMode ? "Update Job" : "Post New Job"}
            </Button>
          )}
          {companies.length === 0 && (
            <p className="my-3 text-xs font-bold text-center text-red-600">
              *Please register a company first, before posting a job
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostJobs;
