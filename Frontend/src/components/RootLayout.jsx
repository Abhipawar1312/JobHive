import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navbar";
import { Loader2 } from "lucide-react";
import ScrollToTop from "./ScrollToTop";

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
    <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
    <div className="flex flex-col items-center gap-0.5 text-center">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
        Loading...
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Please wait a moment
      </p>
    </div>
  </div>
);

const RootLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export default RootLayout;
