import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      loadingBarRef.current.continuousStart();
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
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      loadingBarRef.current.complete();
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto">
      {/* Header with Back button and title */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => navigate("/admin/companies")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Company Setup</h1>
        {/* An empty div to balance the flex layout if needed */}
        <div className="w-10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name */}
        <div>
          <Label>Company Name</Label>
          <Input
            type="text"
            placeholder="Enter company name"
            {...register("name", { required: "Company name is required" })}
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Input
            type="text"
            placeholder="Enter description"
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

        {/* Website */}
        <div>
          <Label>Website</Label>
          <Input
            type="text"
            placeholder="Enter website URL"
            {...register("website", {
              required: "Website is required",
              pattern: {
                value: /^(https?:\/\/)?([\w\d\-_]+\.+\S+)+$/,
                message: "Please enter a valid URL",
              },
            })}
            className="mt-1"
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-500">
              {errors.website.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <Input
            type="text"
            placeholder="Enter location"
            {...register("location", { required: "Location is required" })}
            className="mt-1"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-500">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Logo */}
        <div>
          <Label>Logo</Label>
          <Input
            type="file"
            accept="image/*"
            {...register("file", {
              required: "Logo is required",
              validate: {
                fileType: (value) => {
                  if (value && value.length > 0) {
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/gif",
                    ];
                    return (
                      allowedTypes.includes(value[0].type) ||
                      "Only JPEG, PNG, or GIF images are allowed"
                    );
                  }
                  return true;
                },
                fileSize: (value) => {
                  if (value && value.length > 0) {
                    const maxSize = 1024 * 1024; // 1MB
                    return (
                      value[0].size <= maxSize ||
                      "File size must be less than 1MB"
                    );
                  }
                  return true;
                },
              },
            })}
            className="mt-1"
          />
          {errors.file && (
            <p className="mt-1 text-xs text-red-500">{errors.file.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          {loading ? (
            <Button className="w-full" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...
            </Button>
          ) : (
            <Button type="submit" className="w-full">
              Update
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanySetup;
