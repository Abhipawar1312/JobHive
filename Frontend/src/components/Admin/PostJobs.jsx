import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronsUpDown, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { useSelector } from "react-redux";
import useGetAllCompanies from "@/Hooks/useGetAllCompanies";
import { LoadingBarContext } from "../LoadingBarContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import MDEditor from "@uiw/react-md-editor";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const PostJobs = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Grab jobId from URL
  const { companies } = useSelector((store) => store.company);
  const loadingBarRef = useContext(LoadingBarContext);
  const [open, setOpen] = useState(false);
  const isEditMode = Boolean(jobId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      salary: "",
      location: "",
      jobType: "",
      experience: "",
      position: 0,
      companyId: "",
    },
  });

  // Watch companyId to show the selected company in the popover button
  const selectedCompanyId = watch("companyId");
  const selectedCompany = companies.find(
    (company) => company._id === selectedCompanyId
  );

  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          loadingBarRef.current.continuousStart();
          const res = await axios.get(
            `${JOB_API_END_POINT}/admin/jobs/${jobId}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (res.data.success) {
            const job = res.data.job;
            setValue("title", job.title);
            setValue("description", job.description);
            setValue("requirements", job.requirements);
            setValue("salary", job.salary);
            setValue("location", job.location);
            setValue("jobType", job.jobType);
            setValue("experience", job.experienceLevel);
            setValue("position", job.position);
            setValue("companyId", job.company._id);
          } else {
            toast.error("Failed to fetch job details");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error fetching job details"
          );
        } finally {
          loadingBarRef.current.complete();
        }
      };
      fetchJobDetails();
    }
  }, [jobId, isEditMode, loadingBarRef, setValue]);

  const onSubmit = async (data) => {
    if (!data.companyId) {
      return;
    }
    try {
      const url = isEditMode
        ? `${JOB_API_END_POINT}/update/${jobId}`
        : `${JOB_API_END_POINT}/post`;
      const method = isEditMode ? "put" : "post";
      const res = await axios[method](url, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/jobs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request");
    }
  };

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto">
      {/* Header with Back button and title */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => navigate("/admin/jobs")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Update Job" : "Post a Job"}
        </h1>
        <div className="w-10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            placeholder="Job Title"
            {...register("title", { required: "Title is required" })}
            className="mt-1"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Input
            type="text"
            placeholder="Job Description"
            {...register("description", {
              required: "Description is required",
            })}
            className="mt-1"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Requirements with MDEditor */}
        <div className="md-editor-container">
          <Label>Requirements</Label>
          <Controller
            control={control}
            name="requirements"
            rules={{ required: "Requirements are required" }}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={field.onChange}
                textareaProps={{
                  placeholder: "Please enter the requirements here...",
                }}
              />
            )}
          />
          {errors.requirements && (
            <p className="mt-1 text-xs text-red-500">
              {errors.requirements.message}
            </p>
          )}
        </div>

        {/* Job Type & Experience Level */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Job Type</Label>
            <Input
              type="text"
              placeholder="Job Type"
              {...register("jobType", { required: "Job Type is required" })}
              className="mt-1"
            />
            {errors.jobType && (
              <p className="mt-1 text-xs text-red-500">
                {errors.jobType.message}
              </p>
            )}
          </div>
          <div>
            <Label>Experience Level</Label>
            <Input
              type="text"
              placeholder="Experience Level"
              {...register("experience", {
                required: "Experience Level is required",
              })}
              className="mt-1"
            />
            {errors.experience && (
              <p className="mt-1 text-xs text-red-500">
                {errors.experience.message}
              </p>
            )}
          </div>
        </div>

        {/* No. of Positions & Location */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>No. of Positions</Label>
            <Input
              type="number"
              placeholder="Number of Positions"
              {...register("position", {
                required: "Number of positions is required",
                min: { value: 1, message: "At least one position is required" },
              })}
              className="mt-1"
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-500">
                {errors.position.message}
              </p>
            )}
          </div>

          <div>
            <Label>Location</Label>
            <Input
              type="text"
              {...register("location", { required: "Location is required" })}
              className="my-1"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-500">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Salary */}
          <div>
            <Label>Salary</Label>
            <Input
              type="text"
              placeholder="Salary"
              {...register("salary", { required: "Salary is required" })}
              className="mt-1"
            />
            {errors.salary && (
              <p className="mt-1 text-xs text-red-500">
                {errors.salary.message}
              </p>
            )}
          </div>
          {/* Company Selection */}
          <div>
            {companies.length > 0 && (
              <div className="flex flex-col col-span-1 gap-2 md:col-span-2">
                <Label>Company</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="justify-between w-full"
                    >
                      {selectedCompany
                        ? selectedCompany.name
                        : "Select a Company"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search company..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              key={company._id}
                              value={company.name.toLowerCase()}
                              onSelect={() => {
                                setValue("companyId", company._id);
                                setOpen(false);
                              }}
                            >
                              {company.name}
                              {/* You may implement a check icon here if needed */}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {isSubmitted && !selectedCompanyId && (
                  <p className="text-xs text-red-500">
                    Please select a company.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Submit Button */}
        <div>
          {isSubmitting ? (
            <Button className="w-full" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...
            </Button>
          ) : (
            <Button type="submit" className="w-full">
              {isEditMode ? "Update Job" : "Post Job"}
            </Button>
          )}
          {companies.length === 0 && (
            <p className="my-3 text-xs font-bold text-center text-red-600">
              *Please register a company first, before posting a job
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostJobs;
