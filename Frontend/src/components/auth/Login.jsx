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
import { Loader2, Eye, EyeOff } from "lucide-react"; // Import icons for password toggle
import { LoadingBarContext } from "../LoadingBarContext";

const Login = () => {
  const { loading, user } = useSelector((store) => store.auth);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Set up React Hook Form with default values and validation rules
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });

  // onSubmit receives the validated data from the form
  const onSubmit = async (data) => {
    try {
      loadingBarRef.current.continuousStart();
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      loadingBarRef.current.complete();
      dispatch(setLoading(false));
    }
  };

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div>
      <div className="flex items-center justify-center mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-1/2 p-4 my-10 border border-gray-200 rounded-md"
        >
          <h1 className="mb-5 text-xl font-bold">Login</h1>

          {/* Email Field */}
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

          {/* Password Field with Toggle */}
          <div className="relative my-2">
            <Label>Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="*******"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  // Password must have at least one uppercase letter, one lowercase letter, one digit, and one special character.
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/,
                  message:
                    "Password must have at least one uppercase, one lowercase, one digit and one special character",
                },
              })}
              className="pr-10" // Add right padding for the icon
            />
            {/* Eye toggle button */}
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

          {/* Submit Button */}
          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please Wait
            </Button>
          ) : (
            <Button className="w-full my-4" type="submit">
              Login
            </Button>
          )}

          <span className="text-sm">
            Don't have an account?{" "}
            <Link to={"/signup"} className="text-blue-600">
              Sign Up
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
