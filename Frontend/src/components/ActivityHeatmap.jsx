import React, { useMemo } from "react";
import { Flame, Calendar, CheckCircle2 } from "lucide-react";

/**
 * GitHub-Style 52-Week Candidate Activity Heatmap
 * Visualizes candidate daily applications over the last year.
 */
const ActivityHeatmap = ({ appliedJobs = [] }) => {
    // Generate dates for the past 52 weeks (364 days)
    const { gridWeeks, totalCount, currentStreak } = useMemo(() => {
        const today = new Date();
        const dateMap = {};

        // Aggregate applications by YYYY-MM-DD
        (appliedJobs || []).forEach((app) => {
            const dateStr = new Date(app.createdAt).toISOString().split("T")[0];
            dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
        });

        // Build 52 weeks array (each week has 7 days: Sun-Sat)
        const weeks = [];
        let currDate = new Date();
        currDate.setDate(currDate.getDate() - 363); // 52 weeks back

        let tempWeek = [];
        let streak = 0;
        let countingStreak = true;

        for (let i = 0; i < 364; i++) {
            const dateKey = currDate.toISOString().split("T")[0];
            const count = dateMap[dateKey] || 0;

            tempWeek.push({
                date: dateKey,
                count,
            });

            if (tempWeek.length === 7) {
                weeks.push(tempWeek);
                tempWeek = [];
            }

            currDate.setDate(currDate.getDate() + 1);
        }

        // Calculate streak starting from today backwards
        let checkDate = new Date();
        for (let j = 0; j < 60; j++) {
            const k = checkDate.toISOString().split("T")[0];
            if (dateMap[k] > 0) {
                streak++;
            } else if (j > 0) {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return {
            gridWeeks: weeks,
            totalCount: appliedJobs.length,
            currentStreak: streak,
        };
    }, [appliedJobs]);

    const getIntensityClass = (count) => {
        if (count === 0) return "bg-gray-100 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50";
        if (count === 1) return "bg-emerald-200 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700";
        if (count === 2) return "bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600";
        return "bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400 shadow-sm shadow-emerald-500/20";
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
            {/* Header with Totals and Streak */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Application & Learning Activity
                        </h3>
                        <p className="text-[11px] text-gray-400">
                            {totalCount} submissions in the last 12 months
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span>{currentStreak} Day Streak</span>
                    </div>
                </div>
            </div>

            {/* 52-Week Grid Scroll Container */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1.5 min-w-[700px]">
                    {gridWeeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1.5">
                            {week.map((day) => (
                                <div
                                    key={day.date}
                                    title={`${day.count} application(s) on ${day.date}`}
                                    className={`w-3.5 h-3.5 rounded-[4px] border transition-all hover:scale-125 cursor-pointer ${getIntensityClass(
                                        day.count
                                    )}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend Footer */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                <span>Learn daily, apply consistently</span>
                <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-gray-100 dark:bg-gray-800 border" />
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-200 dark:bg-emerald-900 border" />
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-400 dark:bg-emerald-700 border" />
                    <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600 dark:bg-emerald-500 border" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
