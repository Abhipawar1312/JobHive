import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
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

  // Initialize React Hook Form with default values
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

  // When singleCompany is loaded, reset the form values
  useEffect(() => {
    if (singleCompany) {
      reset({
        name: singleCompany.name || "",
        description: singleCompany.description || "",
        website: singleCompany.website || "",
        location: singleCompany.location || "",
        // File cannot be programmatically set in the input
      });
    }
  }, [singleCompany, reset]);

  // onSubmit handler receives validated data
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
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto my-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-5 p-8">
            <Button
              onClick={() => navigate("/admin/companies")}
              variant="outline"
              className="flex items-center gap-2 font-semibold text-gray-500"
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>
            <h1 className="text-xl font-bold">Company Setup</h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <Label>Company Name</Label>
              <Input
                type="text"
                {...register("name", { required: "Company name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Description */}
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            {/* Website */}
            <div>
              <Label>Website</Label>
              <Input
                type="text"
                {...register("website", {
                  required: "Website is required",
                  pattern: {
                    value: /^(https?:\/\/)?([\w\d\-_]+\.+\S+)+$/,
                    message: "Please enter a valid URL",
                  },
                })}
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>
            {/* Location */}
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                {...register("location", { required: "Location is required" })}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
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
              />
              {errors.file && (
                <p className="text-red-500 text-sm">{errors.file.message}</p>
              )}
            </div>
          </div>
          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Update
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
