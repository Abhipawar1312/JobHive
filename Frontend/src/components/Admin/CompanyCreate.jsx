import React, { useContext, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "../redux/CompanySlice";
import { LoadingBarContext } from "../LoadingBarContext";
import { Building2, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  const registerNewCompany = async (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Please enter a company name.");
      return;
    }

    try {
      setLoading(true);
      if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        { companyName: companyName.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message || "Company registered successfully!");
        const companyId = res?.data?.company?._id;
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register company.");
      console.error(error);
    } finally {
      setLoading(false);
      if (loadingBarRef?.current) loadingBarRef.current.complete();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Top Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-100 dark:border-purple-900 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Register Company</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            What is your company or organization name? You can update full details and logo next.
          </p>
        </div>

        <form onSubmit={registerNewCompany} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Company Name
            </Label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="e.g. Google, Microsoft, JobHive Tech"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10 text-xs rounded-xl h-11 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/companies")}
              className="flex-1 h-11 rounded-xl text-xs font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !companyName.trim()}
              className="flex-1 h-11 bg-[#6A38C2] hover:bg-[#5b30a6] text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                </div>
              ) : (
                "Continue to Setup"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreate;
