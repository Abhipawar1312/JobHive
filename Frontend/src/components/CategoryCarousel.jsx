import React, { useContext } from "react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "./redux/jobSlice";
import Autoplay from "embla-carousel-autoplay";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllJobs from "@/Hooks/useGetAllJobs";

const CategoryCarousel = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);

  const searchJobHandler = (query) => {
    if (loadingBarRef?.current) loadingBarRef.current.continuousStart();
    dispatch(setSearchedQuery(query));
    navigate("/browse");
    if (loadingBarRef?.current) loadingBarRef.current.complete();
  };

  // Create a set of unique job titles (case-insensitive)
  const dynamicCategories = Array.from(
    new Map(
      allJobs.map((job) => {
        const title = job.title.trim();
        return [title.toLowerCase(), title];
      })
    ).values()
  );

  return (
    <div className="px-4">
      <Carousel
        plugins={[
          Autoplay({
            delay: 1000,
            stopOnInteraction: false,
          }),
        ]}
        opts={{ loop: true }}
        className="mx-auto my-20 lg:max-w-7xl"
      >
        <CarouselContent className="flex items-center">
          {dynamicCategories.map((cat, index) => (
            <CarouselItem
              key={index}
              className="px-2 basis-1/2 md:basis-1/3 lg:basis-1/6"
            >
              <button
                onClick={() => searchJobHandler(cat)}
                className="w-full py-2 px-3 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-[#6A38C2] hover:text-white dark:hover:bg-[#6A38C2] dark:hover:text-white hover:border-[#6A38C2] shadow-sm transition-all duration-200 cursor-pointer truncate"
              >
                {cat}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
