import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/authSlice";
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn, UserCheck, Briefcase } from "lucide-react";
import { LoadingBarContext } from "../LoadingBarContext";

const Login = () => {
  const { loading, user } = useSelector((store) => store.auth);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    try {
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/login`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        if (res.data.user?.role === "recruiter") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      if (loadingBarRef?.current) loadingBarRef.current.complete();
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === "recruiter") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Top Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900 shadow-sm">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in to access your JobHive account and applications.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
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
                    message: "Please enter a valid email address",
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

          {/* Password Field with Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
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
            {errors.password && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role Selection Pills */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Account Type</Label>
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer h-11"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </div>
            ) : (
              "Sign In to JobHive"
            )}
          </Button>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                Create Account
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
