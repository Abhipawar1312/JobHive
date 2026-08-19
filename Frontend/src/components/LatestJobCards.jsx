import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-6 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-500/40 dark:hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {job?.company?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job?.location}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-lg font-bold text-[#6A38C2] dark:text-purple-400 mb-1.5 line-clamp-1">
            {job?.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        <Badge
          className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
        >
          {job?.position} Positions
        </Badge>
        <Badge
          className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
        >
          {job?.jobType}
        </Badge>
        <Badge
          className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 font-medium text-xs px-2.5 py-0.5 rounded-lg"
        >
          {job?.salary} LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
