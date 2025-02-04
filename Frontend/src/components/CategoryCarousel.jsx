import React, { useContext } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "./redux/jobSlice";
import companies from "../data/companies.json";
import Autoplay from "embla-carousel-autoplay";
import { LoadingBarContext } from "./LoadingBarContext";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
// const category = [
//   "Frontend Developer",
//   "Backend Developer",
//   "Data Science",
//   "Graphic Designer",
//   "Fullstack Developer",
// ];
const CategoryCarousel = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingBarRef = useContext(LoadingBarContext);
  const searchJobHandler = (query) => {
    loadingBarRef.current.continuousStart();
    dispatch(setSearchedQuery(query));
    navigate("/browse");
    loadingBarRef.current.complete();
  };
  const dynamicCategories = Array.from(
    new Map(
      allJobs.map((job) => {
        const title = job.title.trim();
        return [title.toLowerCase(), title];
      })
    ).values()
  );
  console.log(allJobs, "allJobs");
  console.log(dynamicCategories, "dynamicCategories");
  return (
    <div>
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
        <CarouselContent>
          {dynamicCategories.map((cat, index) => (
            <CarouselItem key={index} className="basis-1/3 md:basis-1/6">
              <Button
                onClick={() => searchJobHandler(cat)}
                variant="outline"
                className="rounded-full"
              >
                {cat}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
      {/* <Carousel
        plugins={[
          Autoplay({
            delay: 1000,
            stopOnInteraction: false,
          }),
        ]}
        className="mx-auto my-20 lg:max-w-7xl"
      >
        <CarouselContent className="flex items-center gap-5 sm:gap-20">
          {companies.map(({ name, id, path }) => (
            <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
              <img
                src={path}
                alt={name}
                className="object-contain h-9 sm:h-14"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel> */}
    </div>
  );
};

export default CategoryCarousel;
