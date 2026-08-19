import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { JOB_API_END_POINT, COMPANY_API_END_POINT } from "@/utils/constant";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";

const FUNNEL_COLORS = ["#6366f1", "#3b82f6", "#8b5cf6", "#a855f7", "#10b981", "#ef4444"];

const RecruiterDashboard = () => {
  const { user } = useSelector((store) => store.auth);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [jobsRes, compRes] = await Promise.all([
          axios.get(`${JOB_API_END_POINT}/getadminjobs`, { withCredentials: true }),
          axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true })
        ]);

        if (jobsRes.data.success) {
          setJobs(jobsRes.data.jobs || []);
        }
        if (compRes.data.success) {
          setCompanies(compRes.data.companies || []);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Aggregates
  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);
  const totalCompanies = companies.length;

  // Compute Funnel Stages
  let pendingCount = 0;
  let reviewingCount = 0;
  let shortlistedCount = 0;
  let interviewCount = 0;
  let acceptedCount = 0;
  let rejectedCount = 0;

  jobs.forEach((job) => {
    (job.applications || []).forEach((app) => {
      const st = (app.status || "pending").toLowerCase();
      if (st === "pending") pendingCount++;
      else if (st === "reviewing") reviewingCount++;
      else if (st === "shortlisted") shortlistedCount++;
      else if (st === "interview") interviewCount++;
      else if (st === "accepted") acceptedCount++;
      else if (st === "rejected") rejectedCount++;
    });
  });

  const funnelData = [
    { stage: "Applied", count: totalApplicants, fill: "#6366f1" },
    { stage: "Reviewing", count: reviewingCount, fill: "#3b82f6" },
    { stage: "Shortlisted", count: shortlistedCount, fill: "#8b5cf6" },
    { stage: "Interview", count: interviewCount, fill: "#a855f7" },
    { stage: "Hired", count: acceptedCount, fill: "#10b981" },
  ];

  // Top Performing Job Posts
  const topJobs = [...jobs]
    .sort((a, b) => (b.applications?.length || 0) - (a.applications?.length || 0))
    .slice(0, 5);

  const jobApplicantsData = topJobs.map((job) => ({
    name: job.title?.length > 16 ? `${job.title.substring(0, 16)}...` : (job.title || "Job"),
    fullName: job.title,
    applicants: job.applications?.length || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-gray-500 font-medium">Loading recruiter analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4 max-w-7xl mx-auto pt-6 space-y-8">
      
      {/* Header Welcome Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Recruiter Analytics & Insights
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time pipeline metrics, conversion funnel, and candidate matching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link to="/admin/jobs/create" className="flex-1 sm:flex-initial">
              <Button className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Post Job Opening
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{totalJobs}</h3>
            <p className="text-[11px] text-purple-600 font-bold mt-1">Live listings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center border border-purple-100 dark:border-purple-900">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Applicants</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{totalApplicants}</h3>
            <p className="text-[11px] text-blue-600 font-bold mt-1">Across all jobs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Interviews</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{interviewCount}</h3>
            <p className="text-[11px] text-amber-600 font-bold mt-1">Scheduled rounds</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-900">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Successful Hires</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{acceptedCount}</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">Accepted offers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hiring Funnel Conversion Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" /> Hiring Funnel Conversion
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Applicant pipeline volume across each stage</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {totalApplicants > 0 ? `${Math.round((acceptedCount / totalApplicants) * 100)}% Conversion` : "0%"}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#374151" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#4b5563" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#4b5563" />
                <Tooltip
                  cursor={{ fill: "rgba(106, 56, 194, 0.08)", radius: 8 }}
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderRadius: "12px",
                    border: "1px solid #374151",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                  }}
                  itemStyle={{ color: "#e5e7eb" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Performing Job Openings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Top-Demand Job Openings
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Most applied positions in your portal</p>
            </div>
            <Link to="/admin/jobs" className="text-xs text-purple-600 hover:underline font-bold">
              View All
            </Link>
          </div>

          {jobApplicantsData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400 italic">
              No jobs posted yet. Create your first opening to view performance.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobApplicantsData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#374151" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#4b5563" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#9ca3af" }} stroke="#4b5563" />
                  <Tooltip
                    cursor={{ fill: "rgba(106, 56, 194, 0.08)", radius: 8 }}
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderRadius: "12px",
                      border: "1px solid #374151",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                    }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Bar dataKey="applicants" fill="#6A38C2" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Openings Quick Access Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-3 border-b dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" /> Active Job Openings Pipeline
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Quick applicant review and pipeline management</p>
          </div>
          <Link to="/admin/jobs">
            <Button variant="outline" size="sm" className="text-xs rounded-xl font-semibold border-gray-200 dark:border-gray-700">
              Manage All Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(() => {
            const activePipelineJobs = jobs.filter((job) => (job.applications?.length || 0) > 0);

            if (activePipelineJobs.length === 0) {
              return (
                <div className="py-8 text-center text-xs text-gray-400">
                  No active applicant pipelines right now. Once candidates apply to your job listings, they will appear here for review.
                </div>
              );
            }

            return activePipelineJobs.slice(0, 5).map((job) => (
              <div key={job._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 px-3 rounded-2xl transition-all">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">{job.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {job.company?.name || "Company"} • {job.location} • {job.jobType}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl border border-purple-100 dark:border-purple-900">
                    {job.applications?.length || 0} Candidates
                  </span>
                  <Link to={`/admin/jobs/${job._id}/applicants`}>
                    <Button size="sm" className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs h-9 px-4 rounded-xl font-bold">
                      Review Pipeline
                    </Button>
                  </Link>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

    </div>
  );
};

export default RecruiterDashboard;
