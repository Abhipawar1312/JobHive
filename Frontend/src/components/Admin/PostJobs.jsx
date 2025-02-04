import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { LoadingBarContext } from "../LoadingBarContext";
import { useForm } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
const cn = (...classes) => classes.filter(Boolean).join(" ");

const PostJobs = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Grab jobId from URL
  const { companies } = useSelector((store) => store.company);
  const loadingBarRef = useContext(LoadingBarContext);
  const [open, setOpen] = useState(false);

  const isEditMode = Boolean(jobId);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
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

  // Watch the companyId so that the popover button shows the proper value
  const selectedCompanyId = watch("companyId");

  // Determine the currently selected company from companies array
  const selectedCompany = companies.find(
    (company) => company._id === selectedCompanyId
  );

  // Fetch job details if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          loadingBarRef.current.continuousStart();
          const res = await axios.get(
            `${JOB_API_END_POINT}/admin/jobs/${jobId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          if (res.data.success) {
            const job = res.data.job;
            // Populate the form values using setValue
            setValue("title", job.title);
            setValue("description", job.description);
            setValue("requirements", job.requirements.join(","));
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

  // Handler for company selection from the custom Select component
  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value
    );
    if (selectedCompany) {
      setValue("companyId", selectedCompany._id);
    }
  };

  // Form submit handler using react-hook-form
  const onSubmit = async (data) => {
    if (!data.companyId) {
      // if company is not selected, do nothing; error message will be shown via isSubmitted condition
      return;
    }
    try {
      const url = isEditMode
        ? `${JOB_API_END_POINT}/update/${jobId}`
        : `${JOB_API_END_POINT}/post`;
      const method = isEditMode ? "put" : "post";
      const res = await axios[method](url, data, {
        headers: {
          "Content-Type": "application/json",
        },
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
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
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
                {...register("title", { required: "Title is required" })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                {...register("description", {
                  required: "Description is required",
                })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label>Requirements</Label>
              <Input
                type="text"
                {...register("requirements", {
                  required: "Requirements are required",
                })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.requirements && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.requirements.message}
                </p>
              )}
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type="text"
                {...register("salary", { required: "Salary is required" })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.salary && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.salary.message}
                </p>
              )}
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                {...register("location", { required: "Location is required" })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                type="text"
                {...register("jobType", { required: "Job Type is required" })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
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
                {...register("experience", {
                  required: "Experience Level is required",
                })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.experience && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>
            <div>
              <Label>No of Positions</Label>
              <Input
                type="number"
                {...register("position", {
                  required: "Number of positions is required",
                  min: {
                    value: 1,
                    message: "At least one position is required",
                  },
                })}
                className="my-1 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
              {errors.position && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.position.message}
                </p>
              )}
            </div>
            {companies.length > 0 && (
              <div className="flex flex-col col-span-2 gap-2">
                <Label>Company</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[400px] justify-between"
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
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedCompanyId === company._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
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
          {isSubmitting ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
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
