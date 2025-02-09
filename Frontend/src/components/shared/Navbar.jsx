import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Bookmark, LogOut, User2, Menu, X } from "lucide-react"; // Using lucide-react's Menu and X icons
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
    <div className="">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
        {/* Logo Section */}
        <div>
          {!user || user.role === "student" ? (
            <Link to="/">
              <h1 className="text-2xl font-bold cursor-pointer">
                Job<span className="text-[#F83002]">Portal</span>
              </h1>
            </Link>
          ) : (
            <h1 className="text-2xl font-bold">
              Job<span className="text-[#F83002]">Portal</span>
            </h1>
          )}
        </div>

        {/* Mobile menu toggle icon (visible on small screens) */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="items-center hidden gap-12 md:flex">
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

      {/* Mobile Menu (visible on small screens when toggled) */}
      {open && (
        <div className="w-full px-4 pb-4 bg-white md:hidden dark:bg-gray-900">
          <ul className="flex flex-col gap-4 font-medium">
            {renderNavLinks()}
          </ul>
          <div className="mt-4">
            <DarkMode />
          </div>
          <div className="mt-4">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] w-full">
                    Signup
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {user && user.role === "student" && (
                  <>
                    <div className="flex items-center gap-2">
                      <User2 className="w-4 h-4" />
                      <Link to="/profile" className="hover:underline">
                        View Profile
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      <Link to="/SavedJobs" className="hover:underline">
                        Saved Jobs
                      </Link>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <button onClick={logoutHandler} className="text-left">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
