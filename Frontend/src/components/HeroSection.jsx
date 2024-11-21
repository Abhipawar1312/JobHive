import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [placeholder] = useTypewriter({
    words: ["Find Your Dream Jobs"],
    loop: {},
    typeSpeed: 120,
    delaySpeed: 80,
  });

  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };
  return (
    <div className="text-center">
      <div className="flex flex-col gap-5 my-10">
        <span className="mx-auto px-4 py-2 bg-gray-100 rounded-full text-[#F83002] font-medium">
          No. 1 Job Hunt Website
        </span>
        <h1 className="text-5xl font-bold">
          Search, Apply & <br /> Get Your{" "}
          <span className="text-[#6A38C2]">Dream Jobs</span>
        </h1>
        <p>
          Discover your next career move and turn your passion into a
          profession.
        </p>
        <div className="flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto">
          <input
            type="text"
            placeholder={`${placeholder} 💻`}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-none outline-none dark:bg-[#020817]"
          />
          <Button
            onClick={searchJobHandler}
            className="rounded-r-full bg-[#6A49C2]"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
