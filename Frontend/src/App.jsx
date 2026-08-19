import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { StarsBackground } from "./components/StarsBackground";
import { ShootingStars } from "./components/ShootingStars";
import LoadingBarProvider from "./components/LoadingBarContext";
import appRouter from "./components/appRouter";
import NetworkStatusBanner from "./components/shared/NetworkStatusBanner";

function App() {
  return (
    <LoadingBarProvider>
      <ThemeProvider>
        {/* Background Layer */}
        <div className="fixed inset-0 overflow-hidden">
          <StarsBackground
            starDensity={0.0001}
            allStarsTwinkle={true}
            twinkleProbability={0.5}
            className="z-0"
          />
          <ShootingStars
            minSpeed={10}
            maxSpeed={30}
            starColor="#FFD700"
            trailColor="#FF4500"
            className="z-0"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 min-h-screen">
          <RouterProvider router={appRouter} />
          <NetworkStatusBanner />
        </div>
      </ThemeProvider>
    </LoadingBarProvider>
  );
}

export default App;
