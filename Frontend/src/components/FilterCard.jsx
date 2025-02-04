import React, { useContext, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import { LoadingBarContext } from "./LoadingBarContext";

// Filter options for Location, Industry, and Salary.
const filterData = [
  {
    filterType: "Location",
    array: ["Delhi", "Banglore", "Hyderabad", "Pune", "Mumbai"],
  },
  {
    filterType: "Industry",
    array: ["Frontend Developer", "Backend Developer", "Fullstack Developer"],
  },
  {
    filterType: "Salary",
    array: ["1 lakh-5 lakh", "6 lakh-10 lakh", "11 lakh - 15lakh"],
  },
];

const parseSalaryRange = (salaryString) => {
  const str = salaryString.replace(/\s/g, "");

  const match = str.match(/(\d+)(k|lakh)-(\d+)(k|lakh)/i);
  if (match) {
    let [, num1, unit1, num2, unit2] = match;
    num1 = parseInt(num1, 10);
    num2 = parseInt(num2, 10);

    const convert = (num, unit) => {
      if (unit.toLowerCase() === "k") return num * 1000;
      if (unit.toLowerCase() === "lakh") return num * 100000;
      return num;
    };

    const min = convert(num1, unit1);
    const max = convert(num2, unit2);
    return { min, max };
  }
  return null;
};

const FilterCard = () => {
  // Two states to hold text-based and salary-based selections.
  const [selectedText, setSelectedText] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const dispatch = useDispatch();
  const loadingBarRef = useContext(LoadingBarContext);

  // Whenever either filter changes, dispatch a new searched query.
  useEffect(() => {
    loadingBarRef.current.continuousStart();
    dispatch(
      setSearchedQuery({
        query: selectedText,
        salaryRange: selectedSalary ? parseSalaryRange(selectedSalary) : null,
      })
    );
    loadingBarRef.current.complete();
  }, [selectedText, selectedSalary, dispatch, loadingBarRef]);

  /**
   * Change handler for the radio group.
   * Determines if the selected value belongs to the salary category (by checking for "k" or "lakh")
   * and updates the corresponding state.
   */
  const changeHandler = (value) => {
    // Check if the first character is a digit (0-9)
    if (/^\d/.test(value)) {
      setSelectedSalary(value);
      setSelectedText("");
    } else {
      setSelectedText(value);
      setSelectedSalary("");
    }
  };

  return (
    <div className="w-full p-3 rounded-md">
      <h1 className="text-lg font-bold">Filter Jobs</h1>
      <hr className="mt-3" />
      <RadioGroup
        value={selectedText || selectedSalary}
        onValueChange={changeHandler}
      >
        {filterData.map((data, index) => (
          <div key={index}>
            <h1 className="text-lg font-bold">{data.filterType}</h1>
            {data.array.map((item, idx) => {
              const itemId = `id${index}-${idx}`;
              return (
                <div key={itemId} className="flex items-center my-2 space-x-2">
                  <RadioGroupItem value={item} id={itemId} />
                  <Label htmlFor={itemId}>{item}</Label>
                </div>
              );
            })}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
