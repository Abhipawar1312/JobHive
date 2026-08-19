import React, { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/Hooks/useGetAllCompanies";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "../redux/CompanySlice";
import { LoadingBarContext } from "../LoadingBarContext";
import { Building2, Plus, Search } from "lucide-react";

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  useEffect(() => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    dispatch(setSearchCompanyByText(input));
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  }, [input, dispatch, loadingBarRef]);

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Header Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Registered Companies</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage and update companies you recruit for.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/admin/companies/create")}
            className="w-full sm:w-auto bg-[#6A38C2] hover:bg-[#5b30a6] text-white h-11 px-5 rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Register New Company
          </Button>
        </div>

        {/* Filter Input */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              placeholder="Search companies by name..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* Companies Table */}
        <CompaniesTable />
      </div>
    </div>
  );
};

export default Companies;
