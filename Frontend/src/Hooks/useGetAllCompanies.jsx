import { setCompanies } from "@/components/redux/CompanySlice";
import { COMPANY_API_END_POINT } from "@/utils/constant";
import apiClient from "@/utils/apiClient";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllCompanies = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    let isMounted = true;
    const fetchCompanies = async () => {
      try {
        const res = await apiClient.get(`${COMPANY_API_END_POINT}/get`);
        if (res.data?.success && isMounted) {
          dispatch(setCompanies(res.data.companies));
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useGetAllCompanies;
