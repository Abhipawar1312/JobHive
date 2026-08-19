import React, { useContext, useEffect, useState } from "react";
import ApplicantsTable from "./ApplicantsTable";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { setAllApplicants } from "../redux/applicationSlice";
import { LoadingBarContext } from "../LoadingBarContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "../ui/button";
import { Download, LayoutGrid, List, ArrowLeft, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const { socket } = useSocket();
  const loadingBarRef = useContext(LoadingBarContext);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"

  const fetchAllApplicants = async () => {
    try {
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/${params.id}/applicants`,
        { withCredentials: true }
      );
      dispatch(setAllApplicants(res.data.job));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load applicants");
    } finally {
      if (loadingBarRef?.current) loadingBarRef.current.complete();
    }
  };

  useEffect(() => {
    fetchAllApplicants();
  }, [params.id, dispatch]);

  // Real-time live update when ATS score or application state changes
  useEffect(() => {
    if (!socket) return;
    socket.on("applicationUpdated", () => {
      fetchAllApplicants();
    });
    return () => {
      socket.off("applicationUpdated");
    };
  }, [socket]);

  const handleExportCSV = async () => {
    try {
      window.open(`${APPLICATION_API_END_POINT}/${params.id}/export-csv`, "_blank");
      toast.success("CSV export initiated");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="px-4 mx-auto max-w-7xl mt-8">
        {/* Header Breadcrumb & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-300">
          <div>
            <Link
              to="/admin/jobs"
              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-semibold mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              {applicants?.title || "Job"} Applicants ({applicants?.applications?.length || 0})
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage candidate pipeline, update review stages, schedule interviews, and export records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-900 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4" /> Table
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-gray-900 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Kanban Board
              </button>
            </div>

            {/* Export CSV Button */}
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl font-semibold border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Main Applicants Component */}
        <div className="mt-6">
          <ApplicantsTable
            viewMode={viewMode}
            onStatusChanged={fetchAllApplicants}
          />
        </div>
      </div>
    </div>
  );
};

export default Applicants;
