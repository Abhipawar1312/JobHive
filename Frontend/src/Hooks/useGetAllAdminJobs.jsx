import { setAllAdminJobs } from "@/components/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import apiClient from "@/utils/apiClient";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    let isMounted = true;
    const fetchAllAdminJobs = async () => {
      try {
        const res = await apiClient.get(`${JOB_API_END_POINT}/getadminjobs`);
        if (res.data?.success && isMounted) {
          dispatch(setAllAdminJobs(res.data.jobs));
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching admin jobs:", error);
      }
    };
    fetchAllAdminJobs();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useGetAllAdminJobs;
