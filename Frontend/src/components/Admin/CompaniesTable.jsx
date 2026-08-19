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
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingBarContext } from "../LoadingBarContext";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);
  const [filterCompany, setFilterCompany] = useState(companies);

  useEffect(() => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    const filteredCompany =
      companies.length >= 0 &&
      companies.filter((company) => {
        if (!searchCompanyByText) {
          return true;
        }
        return company?.name
          ?.toLowerCase()
          .includes(searchCompanyByText.toLowerCase());
      });
    setFilterCompany(filteredCompany);
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  }, [companies, searchCompanyByText, loadingBarRef]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>A list of Your Recent Registered Companies</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterCompany?.map((company) => (
            <TableRow
              key={company._id}
              className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors duration-150"
            >
              <TableCell>
                <div className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-1 flex items-center justify-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={company?.logo} alt={company?.name} />
                  </Avatar>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{company?.name}</TableCell>
              <TableCell className="text-xs text-gray-500 font-medium">{company?.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div
                      onClick={() =>
                        navigate(`/admin/companies/${company?._id}`)
                      }
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300 text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
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

export default CompaniesTable;
