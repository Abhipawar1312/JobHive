import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 hover:border-blue-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
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
        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
          {job?.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {job?.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
          variant="secondary"
        >
          {job?.position} Positions
        </Badge>
        <Badge
          className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
          variant="secondary"
        >
          {job?.jobType}
        </Badge>
        <Badge
          className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
          variant="secondary"
        >
          {job?.salary} LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
