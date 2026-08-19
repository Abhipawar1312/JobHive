import React from "react";

export const JobCardSkeleton = () => {
    return (
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-4/5" />
            </div>
            <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
        </div>
    );
};

export const TableRowSkeleton = ({ cols = 6 }) => {
    return (
        <tr className="animate-pulse border-b border-gray-100 dark:border-gray-800">
            {Array.from({ length: cols }).map((_, idx) => (
                <td key={idx} className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-4/5" />
                </td>
            ))}
        </tr>
    );
};

export const DashboardCardSkeleton = () => {
    return (
        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-md space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-24" />
                <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-md w-16" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800/60 rounded-md w-32" />
        </div>
    );
};

export default { JobCardSkeleton, TableRowSkeleton, DashboardCardSkeleton };
