import React, { useMemo } from "react";
import { IndianRupee, TrendingUp, Sparkles, CheckCircle2, Zap } from "lucide-react";

const SalaryInsights = ({ job }) => {
    const jobSalaryLpa = Number(job?.salary) || 12;
    const title = (job?.title || "Software Engineer").toLowerCase();

    // Calculate benchmark percentiles based on job title & salary
    const benchmark = useMemo(() => {
        let baseMedian = 10;
        if (title.includes("senior") || title.includes("lead")) baseMedian = 22;
        else if (title.includes("architect") || title.includes("manager")) baseMedian = 32;
        else if (title.includes("frontend") || title.includes("react")) baseMedian = 12;
        else if (title.includes("full stack") || title.includes("backend")) baseMedian = 15;
        else if (title.includes("data") || title.includes("ai") || title.includes("ml")) baseMedian = 18;

        const p25 = Math.round(baseMedian * 0.7);
        const p50 = baseMedian;
        const p75 = Math.round(baseMedian * 1.35);
        const p90 = Math.round(baseMedian * 1.75);

        let comparison = "Competitive Market Rate";
        let compBadge = "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800";

        if (jobSalaryLpa >= p75) {
            comparison = "Top 25% Above Market";
            compBadge = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
        } else if (jobSalaryLpa < p25) {
            comparison = "Entry / Growth Potential";
            compBadge = "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
        }

        return { p25, p50, p75, p90, comparison, compBadge };
    }, [jobSalaryLpa, title]);

    // Extract skills or default to high-demand skills
    const trendingSkills = useMemo(() => {
        const skillsFromReqs = (job?.requirements || "").match(/[A-Z][a-zA-Z0-9+#.]+/g) || [];
        const unique = Array.from(new Set(skillsFromReqs.map(s => s.trim()))).filter(s => s.length > 2).slice(0, 5);
        return unique.length > 0 ? unique : ["React", "TypeScript", "Node.js", "System Design", "AWS Cloud"];
    }, [job?.requirements]);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                        <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Salary Insights & Benchmarking
                        </h3>
                        <p className="text-[11px] text-gray-400">Industry standards for {job?.location || "India"}</p>
                    </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${benchmark.compBadge}`}>
                    {benchmark.comparison}
                </span>
            </div>

            {/* Salary Range Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Offered Compensation</span>
                    <span className="text-sm font-extrabold text-[#6A38C2] dark:text-purple-400">
                        ₹{jobSalaryLpa} LPA
                    </span>
                </div>

                <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    <div className="bg-amber-400 h-full w-1/4" title={`25th Percentile: ₹${benchmark.p25} LPA`} />
                    <div className="bg-blue-500 h-full w-1/4" title={`Median (50th): ₹${benchmark.p50} LPA`} />
                    <div className="bg-purple-500 h-full w-1/4" title={`75th Percentile: ₹${benchmark.p75} LPA`} />
                    <div className="bg-emerald-500 h-full w-1/4" title={`90th Percentile: ₹${benchmark.p90} LPA`} />
                </div>

                {/* Percentile labels */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                    <span>25th (₹{benchmark.p25}L)</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">Median (₹{benchmark.p50}L)</span>
                    <span>75th (₹{benchmark.p75}L)</span>
                    <span>Top 90th (₹{benchmark.p90}L)</span>
                </div>
            </div>

            {/* In-Demand Skill Trends */}
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>In-Demand Skill Trends for this Role</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {trendingSkills.map((sk, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-purple-500 transition-colors"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            {sk}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SalaryInsights;
