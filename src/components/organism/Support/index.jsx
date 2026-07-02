import React from "react";
import SuperAdminTour from "../SuperAdminTour";
import FaqChat from "../FaqChat";
import { useLocation } from "react-router-dom";

const Support = () => {
  const notShowLocation = [
    "/",
    "/register",
    "reset-password",
    "/customer-order",
    "/customer-order/checkout",
    "/customer-order/payment",
    "/customer-order/success"
  ];

  const location = useLocation();
  console.log("Support location.pathname:", location.pathname);

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
