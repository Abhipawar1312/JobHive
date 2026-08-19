import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as sonner from "sonner";
import { USER_API_END_POINT, AI_API_END_POINT } from "@/utils/constant";
import { setUser } from "./redux/authSlice";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: "",
    file: null,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setInput({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(", ") || "",
        file: null,
      });
    }
  }, [user, open]);

  const changeEventHandler = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseResumeWithAI = async (selectedFile = null) => {
    const fileToUse = selectedFile || input.file;
    if (!fileToUse && !user?.profile?.resume) {
      sonner.toast.error("Please select a resume PDF file to auto-fill.");
      return;
    }

    try {
      setParsingResume(true);
      const formData = new FormData();
      if (fileToUse) {
        formData.append("file", fileToUse);
      }

      const res = await axios.post(`${AI_API_END_POINT}/parse-resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success && res.data.data) {
        const { fullname, phoneNumber, bio, skills } = res.data.data;
        setInput((prev) => ({
          ...prev,
          fullname: fullname || prev.fullname,
          phoneNumber: phoneNumber || prev.phoneNumber,
          bio: bio || prev.bio,
          skills: skills || prev.skills,
        }));
        sonner.toast.success("✨ Profile details extracted! You can edit any field before saving.");
      }
    } catch (err) {
      console.error("AI Resume Parse Error:", err);
      sonner.toast.error(err.response?.data?.message || "Failed to extract details from resume.");
    } finally {
      setParsingResume(false);
    }
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({ ...prev, file }));
      // Automatically trigger AI extraction when user chooses a resume
      parseResumeWithAI(file);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        sonner.toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      sonner.toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[94vw] sm:max-w-2xl md:max-w-3xl rounded-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-7"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800 pr-6">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Update Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Upload your resume to automatically extract your Bio & Skills, or edit manually.
          </DialogDescription>
        </DialogHeader>

        {/* AI Auto-Fill Helper Banner */}
        <div className="p-3 sm:p-3.5 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-xs text-purple-900 dark:text-purple-200 font-medium">
              {parsingResume ? "Scanning resume with AI..." : "Auto-fill profile details from Resume"}
            </span>
          </div>
          <button
            type="button"
            disabled={parsingResume || (!input.file && !user?.profile?.resume)}
            onClick={() => parseResumeWithAI()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-800 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {parsingResume ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Auto-Fill
              </>
            )}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4 pt-1">
          {/* Resume Upload Input */}
          <div className="p-4 bg-gray-50/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl space-y-2">
            <Label htmlFor="resume-file" className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> Resume (PDF)
            </Label>
            <Input
              id="resume-file"
              name="file"
              type="file"
              accept="application/pdf"
              onChange={fileChangeHandler}
              className="text-xs rounded-xl bg-white dark:bg-gray-950"
            />
            {user?.profile?.resumeOriginalName && !input.file && (
              <p className="text-[11px] text-gray-500 flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Current: {user.profile.resumeOriginalName}
              </p>
            )}
          </div>

          {/* Contact & Personal Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                name="fullname"
                type="text"
                placeholder="e.g. Abhishek Pawar"
                value={input.fullname}
                onChange={changeEventHandler}
                className="text-xs rounded-xl h-10"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={input.email}
                onChange={changeEventHandler}
                className="text-xs rounded-xl h-10"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="number" className="text-xs font-semibold">
                Phone Number
              </Label>
              <Input
                id="number"
                name="phoneNumber"
                type="text"
                placeholder="e.g. 8291579475"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="text-xs rounded-xl h-10"
              />
            </div>
          </div>

          {/* Bio / Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-semibold">
                Bio / Professional Headline
              </Label>
              <span className="text-[10px] text-gray-400">Extracted from resume or write your own</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="e.g. React.js developer with 2+ years of experience building modern web apps..."
              value={input.bio}
              onChange={changeEventHandler}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="skills" className="text-xs font-semibold">
                Technical Skills
              </Label>
              <span className="text-[10px] text-gray-400">Comma-separated</span>
            </div>
            <textarea
              id="skills"
              name="skills"
              rows={3}
              placeholder="e.g. React.js, JavaScript, TypeScript, Redux, Node.js, Express, MongoDB"
              value={input.skills}
              onChange={changeEventHandler}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading || parsingResume}
              className="w-full bg-[#6a38c2] hover:bg-[#5b30a6] text-white rounded-xl text-xs py-2.5 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save & Update Profile"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
