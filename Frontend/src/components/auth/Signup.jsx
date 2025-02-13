import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/authSlice";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { LoadingBarContext } from "../LoadingBarContext";

const Signup = () => {
  const { loading, user } = useSelector((store) => store.auth);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("fullname", data.fullname);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("password", data.password);
    formData.append("role", data.role);
    if (data.file && data.file[0]) {
      formData.append("file", data.file[0]);
    }

    try {
      loadingBarRef.current.continuousStart();
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      loadingBarRef.current.complete();
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="px-4">
      <div className="flex items-center justify-center mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full p-4 my-10 border border-gray-200 rounded-md sm:w-3/4 md:w-1/2"
        >
          <h1 className="mb-5 text-xl font-bold">Sign Up</h1>

          {/* Full Name */}
          <div className="my-2">
            <Label>Full Name</Label>
            <Input
              type="text"
              placeholder="Full Name"
              {...register("fullname", { required: "Full Name is required" })}
            />
            {errors.fullname && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="my-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="abc@gmail.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="my-2">
            <Label>Phone Number</Label>
            <Input
              type="number"
              placeholder="8291579474"
              {...register("phoneNumber", {
                required: "Phone Number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Phone number must be exactly 10 digits",
                },
              })}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password with Toggle */}
          <div className="relative my-2">
            <Label>Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Abcd@1234"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/,
                  message:
                    "Password must have at least one uppercase letter, one lowercase letter, one digit, and one special character",
                },
              })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-600 right-2 top-9"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role Radio Buttons */}
          <div className="flex flex-col my-5">
            <Label>Role</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  value="student"
                  {...register("role", { required: "Role is required" })}
                  className="cursor-pointer"
                />
                <Label>Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  value="recruiter"
                  {...register("role", { required: "Role is required" })}
                  className="cursor-pointer"
                />
                <Label>Recruiter</Label>
              </div>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* File Upload with Validation */}
          <div className="flex flex-col my-2">
            <Label>Profile</Label>
            <Input
              accept="image/*"
              type="file"
              {...register("file", {
                required: "Profile image is required",
                validate: {
                  checkFileType: (value) => {
                    const file = value[0];
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/gif",
                    ];
                    return (
                      (file && allowedTypes.includes(file.type)) ||
                      "Only JPEG, PNG or GIF images are allowed"
                    );
                  },
                  checkFileSize: (value) => {
                    const file = value[0];
                    const maxSize = 1024 * 1024; // 1MB
                    return (
                      (file && file.size <= maxSize) ||
                      "File size must be less than 1MB"
                    );
                  },
                },
              })}
              className="cursor-pointer"
            />
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}
          </div>

          {/* Submit Button */}
          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please Wait
            </Button>
          ) : (
            <Button className="w-full my-4" type="submit">
              Sign Up
            </Button>
          )}

          <span className="text-sm">
            Already have an account?{" "}
            <Link to={"/login"} className="text-blue-600">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
