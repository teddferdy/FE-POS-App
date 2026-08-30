import React from "react";
import SuperAdminTour from "../SuperAdminTour";
import FaqChat from "../FaqChat";
import { useLocation } from "react-router-dom";

const Support = () => {
  const notShowLocation = ["/", "/register", "/reset-password", "/login", "/forgot-password"];

  const location = useLocation();

  return (
    <div className="space-y-6">
      {!notShowLocation.includes(location.pathname) && (
        <>
          <SuperAdminTour />
          <FaqChat />
        </>
      )}
    </div>
  );
};

export default Support;
