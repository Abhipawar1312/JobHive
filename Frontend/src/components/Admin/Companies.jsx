import React, { useContext, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllCompanies from "@/Hooks/useGetAllCompanies";
import { useDispatch } from "react-redux";
import { setSearchCompanyByText } from "../redux/CompanySlice";
import { LoadingBarContext } from "../LoadingBarContext";

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  useEffect(() => {
    loadingBarRef.current.continuousStart();
    dispatch(setSearchCompanyByText(input));
    loadingBarRef.current.complete();
  }, [input, dispatch, loadingBarRef]);

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto my-10">
        <div className="flex flex-col items-center justify-between gap-3 my-5 sm:flex-row">
          <Input
            className="w-full sm:w-auto"
            placeholder="Filter by Name"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/companies/create")}>
            New Company
          </Button>
        </div>
        <CompaniesTable />
      </div>
    </div>
  );
};

export default Companies;
