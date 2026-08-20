import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingBarContext } from "../LoadingBarContext";

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);
  const [filterJobs, setFilterJobs] = useState(allAdminJobs);

  useEffect(() => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    const filteredJobs =
      allAdminJobs.length >= 0 &&
      allAdminJobs.filter((job) => {
        if (!searchJobByText) {
          return true;
        }
        return (
          job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
          job?.company?.name
            ?.toLowerCase()
            .includes(searchJobByText.toLowerCase())
        );
      });
    setFilterJobs(filteredJobs);
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  }, [allAdminJobs, searchJobByText, loadingBarRef]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>A list of Your Recent Posted Jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterJobs?.map((job) => (
            <TableRow
              key={job._id}
              className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors duration-150"
            >
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{job?.company?.name}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{job?.title}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    job?.status === "closed"
                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      job?.status === "closed" ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  {job?.status === "closed" ? "Closed" : "Open"}
                </span>
              </TableCell>
              <TableCell className="text-xs text-gray-500 font-medium">{job?.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div
                      onClick={() => navigate(`/admin/jobs/create/${job._id}`)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </div>
                    <div
                      onClick={() =>
                        navigate(`/admin/jobs/${job._id}/applicants`)
                      }
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Applicants</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;
