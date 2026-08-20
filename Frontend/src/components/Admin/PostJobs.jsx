import React, { useContext, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { AI_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Sparkles, ArrowLeft, Building2 } from "lucide-react";
import useGetAllCompanies from "@/Hooks/useGetAllCompanies";
import { LoadingBarContext } from "../LoadingBarContext";
import { useForm, Controller } from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";

const PostJobs = () => {
  useGetAllCompanies();
  const params = useParams();
  const jobId = params.jobId || params.id;
  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);
  const loadingBarRef = useContext(LoadingBarContext);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const isEditMode = Boolean(jobId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
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
      position: 1,
      status: "open",
      companyId: "",
    },
  });

  const selectedCompanyId = watch("companyId");
  const selectedCompany = companies?.find(
    (company) => company._id === selectedCompanyId
  ) || (companies && companies.length > 0 ? companies[0] : null);

  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId && !isEditMode) {
      setValue("companyId", companies[0]._id);
    }
  }, [companies, selectedCompanyId, setValue, isEditMode]);

  const generateWithAi = async () => {
    const title = watch("title");
    if (!title) {
      toast.error("Please enter a Job Title first so AI can generate the description.");
      return;
    }

    try {
      setIsAiGenerating(true);
      const res = await axios.post(
        `${AI_API_END_POINT}/generate-jd`,
        {
          title,
          companyName: selectedCompany?.name,
          experience: watch("experience"),
          skills: watch("requirements"),
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setValue("description", `We are seeking a talented ${title} to join ${selectedCompany?.name || "our team"}.`);
        setValue("requirements", res.data.description);
        toast.success("Job description generated with AI!");
      }
    } catch (error) {
      toast.error("Failed to generate with AI.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
          const res = await axios.get(
            `${JOB_API_END_POINT}/admin/jobs/${jobId}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (res.data.success) {
            const job = res.data.job;
            const reqFormatted = typeof job.requirements === "string"
              ? job.requirements
              : Array.isArray(job.requirements)
              ? job.requirements.join("\n")
              : "";

            reset({
              title: job.title || "",
              description: job.description || "",
              requirements: reqFormatted,
              salary: job.salary || "",
              location: job.location || "",
              jobType: job.jobType || "",
              experience: job.experienceLevel ?? "",
              position: job.position || 1,
              status: job.status || "open",
              companyId: job.company?._id || job.company || "",
            });
          } else {
            toast.error("Failed to fetch job details");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error fetching job details"
          );
        } finally {
          if (loadingBarRef?.current) loadingBarRef.current.complete();
        }
      };
      fetchJobDetails();
    }
  }, [jobId, isEditMode, loadingBarRef, reset]);

  const onSubmit = async (data) => {
    const finalCompanyId = data.companyId || selectedCompany?._id;
    if (!finalCompanyId) {
      toast.error("Please register your company organization first before posting a job.");
      return;
    }
    try {
      const payload = { ...data, companyId: finalCompanyId };
      const url = isEditMode
        ? `${JOB_API_END_POINT}/update/${jobId}`
        : `${JOB_API_END_POINT}/post`;
      const method = isEditMode ? "put" : "post";
      const res = await axios[method](url, payload, {
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Back Link & Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/admin/jobs")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Recruiter Workspace
          </span>
        </div>

        {/* Top Title & Organization Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            {selectedCompany && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center shadow-sm shrink-0">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      className="w-8 h-8 object-contain rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {selectedCompany.name}
                </h2>
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Update Job Posting" : "Post a New Job Opening"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fill in the role details, requirements, compensation, and qualifications.
            </p>
          </div>
          <button
            type="button"
            onClick={generateWithAi}
            disabled={isAiGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-800 shadow-sm transition-all duration-200 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAiGenerating ? "AI Writing JD..." : "Auto-Draft with AI"}
          </button>
        </div>

        {!selectedCompany && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
            <span>Please register your company organization before posting a job.</span>
            <Button
              size="sm"
              type="button"
              onClick={() => navigate("/admin/companies/create")}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs h-8 shrink-0"
            >
              Register Company
            </Button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title & Description Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Title</Label>
              <Input
                type="text"
                placeholder="e.g. Senior Full Stack Engineer"
                {...register("title", { required: "Job title is required" })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Short Summary</Label>
              <Input
                type="text"
                placeholder="Brief summary of the position"
                {...register("description", {
                  required: "Description is required",
                })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.description && (
                <p className="text-[11px] text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Requirements with MDEditor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Detailed Responsibilities & Requirements (Markdown Supported)
            </Label>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <Controller
                control={control}
                name="requirements"
                rules={{ required: "Requirements are required" }}
                render={({ field }) => (
                  <MDEditor
                    value={field.value}
                    onChange={field.onChange}
                    textareaProps={{
                      placeholder: "Enter responsibilities, tech stack, and qualifications here...",
                    }}
                  />
                )}
              />
            </div>
            {errors.requirements && (
              <p className="text-[11px] text-red-500 font-medium">{errors.requirements.message}</p>
            )}
          </div>

          {/* Job Type & Experience Level Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Type</Label>
              <Input
                type="text"
                placeholder="e.g. Full-Time, Remote, Part-Time"
                {...register("jobType", { required: "Job Type is required" })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.jobType && (
                <p className="text-[11px] text-red-500 font-medium">{errors.jobType.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Experience (Years)</Label>
              <Input
                type="number"
                placeholder="e.g. 2"
                {...register("experience", {
                  required: "Experience Level is required",
                })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.experience && (
                <p className="text-[11px] text-red-500 font-medium">{errors.experience.message}</p>
              )}
            </div>
          </div>

          {/* No. of Positions, Location & Salary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Open Positions</Label>
              <Input
                type="number"
                placeholder="e.g. 3"
                {...register("position", {
                  required: "Number of positions is required",
                  min: { value: 1, message: "At least one position is required" },
                })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.position && (
                <p className="text-[11px] text-red-500 font-medium">{errors.position.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Location</Label>
              <Input
                type="text"
                placeholder="e.g. Mumbai, Pune, Remote"
                {...register("location", { required: "Location is required" })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.location && (
                <p className="text-[11px] text-red-500 font-medium">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Annual Salary (LPA)</Label>
              <Input
                type="number"
                placeholder="e.g. 12"
                {...register("salary", { required: "Salary is required" })}
                className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              {errors.salary && (
                <p className="text-[11px] text-red-500 font-medium">{errors.salary.message}</p>
              )}
            </div>
          </div>

          {/* Job Opening Status (Active Hiring / Closed) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Opening Status</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  watch("status") === "open"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="open"
                  {...register("status")}
                  className="sr-only"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div className="flex flex-col text-left">
                  <span className="text-xs">Active / Open</span>
                  <span className="text-[10px] font-normal text-emerald-600/80 dark:text-emerald-400/80">
                    Visible to candidates & accepting applications
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  watch("status") === "closed"
                    ? "border-red-500 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value="closed"
                  {...register("status")}
                  className="sr-only"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <div className="flex flex-col text-left">
                  <span className="text-xs">Closed / Paused</span>
                  <span className="text-[10px] font-normal text-red-600/80 dark:text-red-400/80">
                    Hidden from candidate searches & feeds
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedCompany}
              className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Job Opening...
                </div>
              ) : isEditMode ? (
                "Update Job Opening"
              ) : (
                "Publish Job Opening"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobs;
