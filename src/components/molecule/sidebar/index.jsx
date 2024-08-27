import React from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

import { SquareUser, ShoppingBasketIcon, Crown } from "lucide-react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";

// Assets
import LogoSidebar from "../../../assets/logo-sidebar.png";

const SideBar = ({ classNameContainer }) => {
  const navigate = useNavigate();
  const urlNow = useLocation();

  return (
    <div className="flex flex-col justify-center items-center my-6 gap-14">
      <div className="w-10 h-10" onClick={() => navigate("/home")}>
        <img src={LogoSidebar} alt="logo-sidebar" className="object-cover w-full cursor-pointer" />
      </div>
      <div className="flex flex-col gap-8">
        <HoverCard>
          <HoverCardTrigger>
            <div
              className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
              onClick={() => navigate("/admin-page")}>
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/admin-page" ? "bg-[#6853F0]" : "bg-[#ffcf40]"} rounded-full`}>
                <Crown
                  className="w-full"
                  color={`${urlNow.pathname === "/admin-page" ? "#ffcf40" : "#fff"}`}
                />
              </div>
              <p className={classNameContainer}>Admin Menu</p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/admin-page" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
                <Crown
                  className="w-full"
                  color={`${urlNow.pathname === "/admin-page" ? "#fff" : "#000"}`}
                />
              </div>
              <p>Admin Menu</p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger>
            <div
              className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
              onClick={() => navigate("/home")}>
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/home" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
                <ShoppingBasketIcon
                  className="w-full"
                  color={`${urlNow.pathname === "/home" ? "#fff" : "#000"}`}
                />
              </div>
              <p className={classNameContainer}>List Product</p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/home" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
                <ShoppingBasketIcon
                  className="w-full"
                  color={`${urlNow.pathname === "/home" ? "#fff" : "#000"}`}
                />
              </div>
              <p>List Product</p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger>
            <div
              className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
              onClick={() => navigate("/membership")}>
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/membership" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
                <SquareUser
                  className="w-full"
                  color={`${urlNow.pathname === "/membership" ? "#fff" : "#000"}`}
                />
              </div>
              <p className={classNameContainer}>Membership</p>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
              <div
                className={`w-14 h-14 p-4 ${urlNow.pathname === "/membership" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
                <SquareUser
                  className="w-full"
                  color={`${urlNow.pathname === "/membership" ? "#fff" : "#000"}`}
                />
              </div>
              <p>Membership</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

SideBar.defaultProps = {
  classNameContainer: ""
};

SideBar.propTypes = {
  classNameContainer: PropTypes.string
};

export default SideBar;
