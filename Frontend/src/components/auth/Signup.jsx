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
import { 
    Loader2, 
    Eye, 
    EyeOff, 
    UserPlus, 
    Mail, 
    Lock, 
    User, 
    Phone, 
    Image as ImageIcon, 
    UserCheck, 
    Briefcase,
    CheckCircle2
} from "lucide-react";
import { LoadingBarContext } from "../LoadingBarContext";

const Signup = () => {
  const { loading, user } = useSelector((store) => store.auth);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "student",
    },
  });

  const selectedRole = watch("role");
  const watchPassword = watch("password");

  // Password strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getPasswordStrength(watchPassword);

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
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Account created successfully! Please sign in.");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      if (loadingBarRef?.current) loadingBarRef.current.complete();
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Top Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900 shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Join JobHive to discover jobs or recruit top talent.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</Label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="e.g. Abhishek Pawar"
                {...register("fullname", { required: "Full Name is required" })}
                className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>
            {errors.fullname && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.fullname.message}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Valid email required",
                    },
                  })}
                  className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="tel"
                  placeholder="9876543210"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Must be 10 digits",
                    },
                  })}
                  className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500 font-medium">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Password with Toggle & Strength */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
                      "Must have 1 uppercase, 1 lowercase, 1 number & 1 special character",
                  },
                })}
                className="pl-10 pr-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {watchPassword && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Password Strength:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                  <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                  <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role Selection Pills */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Join As</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedRole === "student"
                  ? "border-[#6A38C2] bg-purple-50/50 dark:bg-purple-950/40 text-[#6A38C2] dark:text-purple-300 font-bold shadow-sm"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  value="student"
                  {...register("role", { required: "Role is required" })}
                  className="sr-only"
                />
                <UserCheck className="w-4 h-4" />
                <span className="text-xs">Candidate</span>
              </label>

              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedRole === "recruiter"
                  ? "border-[#6A38C2] bg-purple-50/50 dark:bg-purple-950/40 text-[#6A38C2] dark:text-purple-300 font-bold shadow-sm"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  value="recruiter"
                  {...register("role", { required: "Role is required" })}
                  className="sr-only"
                />
                <Briefcase className="w-4 h-4" />
                <span className="text-xs">Recruiter</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-[11px] text-red-500 font-medium">{errors.role.message}</p>
            )}
          </div>

          {/* Profile Photo File Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Profile Photo
            </Label>
            <Input
              accept="image/*"
              type="file"
              {...register("file", {
                required: "Profile image is required",
                validate: {
                  checkFileType: (value) => {
                    const file = value[0];
                    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                    return (
                      (file && allowedTypes.includes(file.type)) ||
                      "Only JPEG, PNG, WEBP or GIF images allowed"
                    );
                  },
                  checkFileSize: (value) => {
                    const file = value[0];
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    return (
                      (file && file.size <= maxSize) ||
                      "File size must be less than 2MB"
                    );
                  },
                },
              })}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFileName(e.target.files[0].name);
                }
              }}
              className="text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-pointer"
            />
            {errors.file && (
              <p className="text-[11px] text-red-500 font-medium">{errors.file.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                Sign In
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
