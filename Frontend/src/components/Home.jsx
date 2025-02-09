import React, { useContext, useEffect } from "react";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import Footer from "./shared/Footer";
import useGetAllJobs from "@/Hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingBarContext } from "./LoadingBarContext";

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const loadingBarRef = useContext(LoadingBarContext);
  const navigate = useNavigate();
  useEffect(() => {
    loadingBarRef.current.continuousStart();
    loadingBarRef.current.complete();
    if (user?.role === "recruiter") {
      navigate("/admin/companies");
    }
  }, []);
  return (
    <>

      <HeroSection />
      <CategoryCarousel />
      <LatestJobs />
      <Footer />
    </>
  );
};

export default Home;
