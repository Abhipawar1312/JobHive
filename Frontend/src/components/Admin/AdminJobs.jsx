import React, { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import AdminJobsTable from "./AdminJobsTable";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetAllAdminJobs from "@/Hooks/useGetAllAdminJobs";
import { setSearchJobByText } from "../redux/jobSlice";
import { LoadingBarContext } from "../LoadingBarContext";
import { Briefcase, Plus, Search } from "lucide-react";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    dispatch(setSearchJobByText(input));
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  }, [input, loadingBarRef]);

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Header Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Posted Job Openings</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Track, edit, and view applicant pools for your published jobs.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/admin/jobs/create")}
            className="w-full sm:w-auto bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </div>

        {/* Filter Input */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              placeholder="Filter by Job Title or Role..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Jobs Table */}
        <AdminJobsTable />
      </div>
    </div>
  );
};

export default AdminJobs;
