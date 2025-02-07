// useGetAllSavedJobs.js
import { setAllSavedJobs } from "@/components/redux/savedJobSlice";
import { SAVEDJOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllSavedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllSavedJobs = async () => {
      try {
        const res = await axios.get(`${SAVEDJOB_API_END_POINT}/list`, {
          withCredentials: true,
        });
        // If the API call is successful, dispatch the data to the Redux store.
        if (res.data.success) {
          console.log(res.data.savedJobs);
          dispatch(setAllSavedJobs(res.data.savedJobs));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllSavedJobs();
  }, [dispatch]);
};

export default useGetAllSavedJobs;
