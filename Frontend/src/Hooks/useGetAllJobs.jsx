import { setAllJobs } from "@/components/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import apiClient from "@/utils/apiClient";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "./useDebounce";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { searchedQuery } = useSelector((store) => store.job);
  const [loading, setLoading] = useState(false);

  // Debounce the searchedQuery object or string by 350ms
  const debouncedQuery = useDebounce(searchedQuery, 350);

  useEffect(() => {
    let isMounted = true;

    const fetchAllJobs = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (typeof debouncedQuery === "object" && debouncedQuery !== null) {
          if (debouncedQuery.query) params.append("keyword", debouncedQuery.query);
          if (debouncedQuery.location) params.append("location", debouncedQuery.location);
          if (debouncedQuery.jobType) params.append("jobType", debouncedQuery.jobType);
          if (debouncedQuery.experienceLevel !== undefined && debouncedQuery.experienceLevel !== "") {
            params.append("experienceLevel", debouncedQuery.experienceLevel);
          }
          if (debouncedQuery.minSalary && debouncedQuery.minSalary > 0) {
            params.append("minSalary", debouncedQuery.minSalary);
          }
        } else if (typeof debouncedQuery === "string" && debouncedQuery.trim()) {
          params.append("keyword", debouncedQuery.trim());
        }

        const queryString = params.toString();
        const url = `${JOB_API_END_POINT}/get${queryString ? `?${queryString}` : ""}`;

        const res = await apiClient.get(url);
        if (res.data?.success && isMounted) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching jobs:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllJobs();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, dispatch]);

  return { loading };
};

export default useGetAllJobs;
