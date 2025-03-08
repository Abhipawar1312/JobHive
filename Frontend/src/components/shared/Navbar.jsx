import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Bookmark,
  LogOut,
  User2,
  Menu,
  X,
  Home,
  BriefcaseIcon,
  CompassIcon,
  Building2,
  ShieldCheck,
} from "lucide-react";
import DarkMode from "./DarkMode";
import { LoadingBarContext } from "../LoadingBarContext";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "../redux/authSlice";
import { clearSavedJobs } from "../redux/savedJobSlice";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      loadingBarRef.current.continuousStart();
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        dispatch(clearSavedJobs());
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      loadingBarRef.current.complete();
    }
  };

  // Helper function to render navigation links based on user role
  const renderNavLinks = () => {
    if (user && user.role === "recruiter") {
      return (
        <>
          <li>
            <Link to="/admin/companies">Companies</Link>
          </li>
          <li>
            <Link to="/admin/jobs">Jobs</Link>
          </li>
        </>
      );
    }
    return (
      <>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/jobs">Jobs</Link>
        </li>
        <li>
          <Link to="/browse">Browse</Link>
        </li>
      </>
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
        {/* Logo Section */}
        <div>
          {!user || user.role === "student" ? (
            <Link to="/">
              <h1 className="text-2xl font-bold cursor-pointer">
                Job<span className="text-[#F83002]">Hive</span>
              </h1>
            </Link>
          ) : (
            <h1 className="text-2xl font-bold">
              Job<span className="text-[#F83002]">Hive</span>
            </h1>
          )}
        </div>

        {/* Mobile menu toggle icon (visible on small screens) */}
        <div className="flex items-center gap-4 md:hidden">
          <DarkMode />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="items-center hidden gap-5 md:flex">
          <ul className="flex items-center gap-5 font-medium">
            {renderNavLinks()}
          </ul>
          <DarkMode />
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt={user?.fullname || "User Avatar"}
                  />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.profile?.profilePhoto}
                        alt={user?.fullname || "User Avatar"}
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{user?.fullname}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col my-2 text-gray-600">
                    {user && user.role === "student" && (
                      <>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <User2 className="w-4 h-4" />
                          <Button variant="link">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Bookmark className="w-4 h-4" />
                          <Button variant="link">
                            <Link to="/SavedJobs">Saved Jobs</Link>
                          </Button>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2 cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      <Button onClick={logoutHandler} variant="link">
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Mobile Menu - Sliding from right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold dark:text-white">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user?.profile?.profilePhoto}
                  alt={user?.fullname || "User Avatar"}
                />
              </Avatar>
              <div>
                <h4 className="font-medium">{user?.fullname}</h4>
                <p className="text-sm text-gray-400">{user?.profile?.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Navigation Links */}
        <nav className="py-2">
          <ul className="space-y-1">
            {!user ? (
              // Not logged in - show public navigation and auth buttons
              <>
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <BriefcaseIcon className="w-5 h-5" />
                    <span>Jobs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/browse"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <CompassIcon className="w-5 h-5" />
                    <span>Browse</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <User2 className="w-5 h-5" />
                    <span>Signup</span>
                  </Link>
                </li>
              </>
            ) : user.role === "recruiter" ? (
              // Recruiter navigation
              <>
                <li>
                  <Link
                    to="/admin/companies"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Companies</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/jobs"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <BriefcaseIcon className="w-5 h-5" />
                    <span>Jobs</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logoutHandler();
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              // Student navigation
              <>
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <BriefcaseIcon className="w-5 h-5" />
                    <span>Jobs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/browse"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <CompassIcon className="w-5 h-5" />
                    <span>Browse</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <User2 className="w-5 h-5" />
                    <span>View Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/SavedJobs"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>Saved Jobs</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logoutHandler();
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;
