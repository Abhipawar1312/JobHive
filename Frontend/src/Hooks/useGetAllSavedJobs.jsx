import { setAllSavedJobs } from "@/components/redux/savedJobSlice";
import { SAVEDJOB_API_END_POINT } from "@/utils/constant";
import apiClient from "@/utils/apiClient";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllSavedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    let isMounted = true;
    const fetchAllSavedJobs = async () => {
      try {
        const res = await apiClient.get(`${SAVEDJOB_API_END_POINT}/list`);
        if (res.data?.success && isMounted) {
          dispatch(setAllSavedJobs(res.data.savedJobs));
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching saved jobs:", error);
      }
    };
    fetchAllSavedJobs();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useGetAllSavedJobs;
