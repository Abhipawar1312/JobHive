import React, { useContext, useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useTypewriter } from "react-simple-typewriter";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { LoadingBarContext } from "./LoadingBarContext";

const HeroSection = () => {
  const [placeholder] = useTypewriter({
    words: ["Find Your Dream Jobs"],
    loop: {}, // Infinite loop
    typeSpeed: 120,
    delaySpeed: 80,
  });

  const [query, setQuery] = useState("");
  const loadingBarRef = useContext(LoadingBarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    loadingBarRef.current.continuousStart();
    dispatch(setSearchedQuery(query));
    navigate("/browse");
    loadingBarRef.current.complete();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchJobHandler();
    }
  };

  return (
    <div className="px-4 text-center">
      <div className="flex flex-col gap-5 my-10">
        <span className="mx-auto px-4 py-2 bg-gray-100 rounded-full text-[#F83002] font-medium">
          No. 1 JobHive Website
        </span>
        <h1 className="text-3xl font-bold md:text-5xl">
          Search, Apply & <br /> Get Your{" "}
          <span className="text-[#6A38C2]">Dream Jobs</span>
        </h1>
        <p className="text-base md:text-lg">
          Discover your next career move and turn your passion into a
          profession.
        </p>
        <div className="flex w-full md:w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto">
          <input
            type="text"
            placeholder={`${placeholder} 💻`}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border-none outline-none dark:bg-[#020817] py-2"
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
