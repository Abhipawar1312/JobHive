import React, { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/Hooks/useGetAllCompanies";
import { useDispatch, useSelector } from "react-redux";
import { setSearchCompanyByText } from "../redux/CompanySlice";
import { LoadingBarContext } from "../LoadingBarContext";
import { Building2, Plus, Edit2, Globe, MapPin, Briefcase } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";

const Companies = () => {
  useGetAllCompanies();
  const { companies } = useSelector((store) => store.company);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  const myCompany = companies && companies.length > 0 ? companies[0] : null;

  useEffect(() => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    dispatch(setSearchCompanyByText(input));
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  }, [input, dispatch, loadingBarRef]);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">

        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Company Organization Profile
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage your organization details, branding, and hiring settings.
              </p>
            </div>
          </div>

          {myCompany ? (
            <Button
              onClick={() => navigate(`/admin/companies/${myCompany._id}`)}
              className="w-full sm:w-auto bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Company Profile
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/admin/companies/create")}
              className="w-full sm:w-auto bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Register Your Company
            </Button>
          )}
        </div>

        {myCompany ? (
          /* Single Dedicated Organization Card */
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 dark:from-purple-950/20 dark:to-indigo-950/20 border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-purple-200 dark:border-purple-900 bg-white dark:bg-gray-800 p-2 flex items-center justify-center shadow-md">
                <Avatar className="w-16 h-16 rounded-xl">
                  <AvatarImage src={myCompany.logo} alt={myCompany.name} />
                </Avatar>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">{myCompany.name}</h2>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {myCompany.description || "No company description provided yet. Click edit to describe your mission and culture."}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {myCompany.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" /> {myCompany.location}
                    </span>
                  )}
                  {myCompany.website && (
                    <a
                      href={myCompany.website.startsWith("http") ? myCompany.website : `https://${myCompany.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> {myCompany.website}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Registered on {myCompany.createdAt?.split("T")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-wrap items-center justify-end gap-3">

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/jobs")}
                  className="rounded-xl text-xs h-9"
                >
                  View Company Jobs
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/admin/jobs/create")}
                  className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl text-xs h-9 shadow-sm"
                >
                  + Post Job for {myCompany.name}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Onboarding */
          <div className="text-center py-12 px-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Register Your Company Organization</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Set up your company profile, logo, and website to start publishing verified job openings and hiring top candidates.
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/companies/create")}
              className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl text-xs h-10 px-6 font-bold shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Register Company
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
