import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Building2, Globe, MapPin, Image as ImageIcon, FileText } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/Hooks/useGetCompanyById";
import { LoadingBarContext } from "../LoadingBarContext";

const CompanySetup = () => {
  const { id } = useParams();
  useGetCompanyById(id);
  const { singleCompany } = useSelector((store) => store.company);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      website: "",
      location: "",
      file: null,
    },
  });

  // Populate form fields when the company data is loaded
  useEffect(() => {
    if (singleCompany) {
      reset({
        name: singleCompany.name || "",
        description: singleCompany.description || "",
        website: singleCompany.website || "",
        location: singleCompany.location || "",
      });
    }
  }, [singleCompany, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("website", data.website);
    formData.append("location", data.location);
    if (data.file && data.file[0]) {
      formData.append("file", data.file[0]);
    }
    try {
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      setLoading(true);
      const res = await axios.put(
        `${COMPANY_API_END_POINT}/update/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Company updated successfully!");
        navigate("/admin/companies");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update company.");
    } finally {
      if (loadingBarRef?.current) loadingBarRef.current.complete();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Back Link & Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/admin/companies")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </button>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Recruiter Portal
          </span>
        </div>

        {/* Top Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Company Profile Setup</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete your company profile, branding logo, and contact details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Company Name</Label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  {...register("name", { required: "Company name is required" })}
                  className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Website URL</Label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="https://example.com"
                  {...register("website", {
                    required: "Website is required",
                    pattern: {
                      value: /^(https?:\/\/)?([\w\d\-_]+\.+\S+)+$/,
                      message: "Please enter a valid URL",
                    },
                  })}
                  className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              {errors.website && (
                <p className="text-[11px] text-red-500 font-medium">{errors.website.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Headquarters / Location</Label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="e.g. Mumbai, India / Remote"
                  {...register("location", { required: "Location is required" })}
                  className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              {errors.location && (
                <p className="text-[11px] text-red-500 font-medium">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Company Description</Label>
            <textarea
              rows={3}
              placeholder="Tell candidates about your company mission, culture, and team..."
              {...register("description", { required: "Description is required" })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Logo Upload with Existing Thumbnail */}
          <div className="space-y-1.5 p-3.5 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Company Logo
              </Label>
              {singleCompany?.logo && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Current Logo:</span>
                  <img src={singleCompany.logo} alt="Company logo" className="w-6 h-6 rounded-md object-cover border" />
                </div>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              {...register("file")}
              className="text-xs rounded-xl h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/companies")}
              className="flex-1 h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </div>
              ) : (
                "Save & Update Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
