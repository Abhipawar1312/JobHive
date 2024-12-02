import React, { createContext, useRef } from "react";
import LoadingBar from "react-top-loading-bar";

export const LoadingBarContext = createContext(null);

const LoadingBarProvider = ({ children }) => {
  const loadingBarRef = useRef(null);

  return (
    <LoadingBarContext.Provider value={loadingBarRef}>
      {/* Global Loading Bar */}
      <LoadingBar color="#6A38C2" ref={loadingBarRef} height={3} />
      {children}
    </LoadingBarContext.Provider>
  );
};

export default LoadingBarProvider;
