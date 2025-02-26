"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTypewriter } from "react-simple-typewriter";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "./redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { LoadingBarContext } from "./LoadingBarContext";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [placeholder] = useTypewriter({
    words: [
      "Search for job titles...",
      "Find companies hiring now...",
      "Discover your next opportunity...",
    ],
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
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-4 text-center"
      >
        <div className="flex flex-col gap-5 my-10">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="mx-auto px-4 py-2 bg-gray-100 rounded-full text-[#F83002] font-medium"
          >
            No. 1 JobHive Website
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-3xl font-bold md:text-5xl"
          >
            Search, Apply & <br /> Get Your{" "}
            <span className="text-[#6A38C2]">Dream Jobs</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base md:text-lg"
          >
            Discover your next career move and turn your passion into a
            profession.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="flex w-full md:w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto"
          >
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
