import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import { LoadingBarContext } from "./LoadingBarContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Filter, RotateCcw, MapPin, Briefcase, IndianRupee, Clock } from "lucide-react";

const locations = ["All", "Remote", "Bangalore", "Hyderabad", "Pune", "Delhi", "Mumbai", "Noida"];
const jobTypes = ["All", "Full-Time", "Part-Time", "Remote", "Internship", "Contract"];
const experienceLevels = [
    { label: "All Experience", value: "" },
    { label: "Fresher / Entry (0-1 yr)", value: "1" },
    { label: "Mid Level (1-4 yrs)", value: "4" },
    { label: "Senior Level (5+ yrs)", value: "10" }
];

const FilterCard = () => {
    const [keyword, setKeyword] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedJobType, setSelectedJobType] = useState("All");
    const [selectedExp, setSelectedExp] = useState("");
    const [minSalary, setMinSalary] = useState(0);

    const dispatch = useDispatch();
    const loadingBarRef = useContext(LoadingBarContext);

    useEffect(() => {
        if (loadingBarRef?.current) loadingBarRef.current.continuousStart();

        dispatch(
            setSearchedQuery({
                query: keyword.trim(),
                location: selectedLocation === "All" ? "" : selectedLocation,
                jobType: selectedJobType === "All" ? "" : selectedJobType,
                experienceLevel: selectedExp,
                minSalary: minSalary > 0 ? minSalary : 0,
            })
        );

        if (loadingBarRef?.current) loadingBarRef.current.complete();
    }, [keyword, selectedLocation, selectedJobType, selectedExp, minSalary, dispatch]);

    const handleReset = () => {
        setKeyword("");
        setSelectedLocation("All");
        setSelectedJobType("All");
        setSelectedExp("");
        setMinSalary(0);
    };

    return (
        <div className="w-full p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <span>Filter Jobs</span>
                </div>
                <button
                    onClick={handleReset}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
            </div>

            {/* Keyword Search */}
            <div>
                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keyword Search</Label>
                <Input
                    placeholder="e.g. React, Python, Manager"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="mt-1.5 text-xs rounded-xl"
                />
            </div>

            {/* Location Selector */}
            <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-purple-600" /> Location
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {locations.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => setSelectedLocation(loc)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                selectedLocation === loc
                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300"
                            }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Type Selector */}
            <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Briefcase className="h-3.5 w-3.5 text-purple-600" /> Job Type
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {jobTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedJobType(type)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                selectedJobType === type
                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Min Salary Range Slider */}
            <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-purple-600" /> Min Salary
                    </span>
                    <span className="text-purple-600 font-bold">{minSalary === 0 ? "Any" : `₹${minSalary} LPA+`}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
            </div>

            {/* Experience Level */}
            <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="h-3.5 w-3.5 text-purple-600" /> Experience Level
                </div>
                <select
                    value={selectedExp}
                    onChange={(e) => setSelectedExp(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                    {experienceLevels.map((exp) => (
                        <option key={exp.label} value={exp.value}>
                            {exp.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterCard;
