import React, { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import AdminJobsTable from "./AdminJobsTable";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetAllAdminJobs from "@/Hooks/useGetAllAdminJobs";
import { setSearchJobByText } from "../redux/jobSlice";
import { LoadingBarContext } from "../LoadingBarContext";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    loadingBarRef.current.continuousStart();
    dispatch(setSearchJobByText(input));
    loadingBarRef.current.complete();
  }, [input, loadingBarRef]);

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto my-10">
        <div className="flex flex-col items-center justify-between gap-3 my-5 sm:flex-row">
          <Input
            className="w-full sm:w-fit"
            placeholder="Filter by Name, Role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/jobs/create")}>
            New Jobs
          </Button>
        </div>
        <AdminJobsTable />
      </div>
    </div>
  );
};

export default AdminJobs;
