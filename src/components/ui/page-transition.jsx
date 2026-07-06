/* eslint-disable react/prop-types */
import React from "react";
import { useLocation, Routes } from "react-router-dom";

export const AnimatedRoutes = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname + location.search}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Routes location={location}>{children}</Routes>
    </div>
  );
};

const PageTransition = ({ children, className = "" }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;
