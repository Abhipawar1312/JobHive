import { setAllAppliedJobs } from "@/components/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import apiClient from "@/utils/apiClient";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    const fetchAppliedJobs = async () => {
      try {
        const res = await apiClient.get(`${APPLICATION_API_END_POINT}/get`);
        if (res.data?.success && isMounted) {
          dispatch(setAllAppliedJobs(res.data.application));
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching applied jobs:", error);
      }
    };
    fetchAppliedJobs();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useGetAppliedJobs;
