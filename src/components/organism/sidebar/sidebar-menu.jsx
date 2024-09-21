import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

import {
  ShoppingBasketIcon,
  Crown,
  MapPin,
  Clipboard,
  Calculator,
  UtensilsCrossed,
  BookUser,
  ClipboardType,
  Percent,
  AlarmClock,
  Wallet
} from "lucide-react";

// Assets
import LogoSidebar from "../../../assets/logo-sidebar.png";

const SideBarMenu = ({ classNameContainer, user }) => {
  const navigate = useNavigate();
  const urlNow = useLocation();

  const MENU_LIST = useMemo(() => {
    if (user.userType === "admin") {
      return (
        <div className="flex flex-col gap-8">
          {/* Admin Menu */}
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
          {/* Back to cashier app */}

          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/home")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/home" ? "bg-[#6853F0]" : "bg-[#ffcf40]"} rounded-full`}>
              <Calculator
                className="w-full"
                color={`${urlNow.pathname === "/home" ? "#ffcf40" : "#fff"}`}
              />
            </div>
            <p className={classNameContainer}>Kembali Ke Cashier App</p>
          </div>

          {/* Location */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/location-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/location-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <MapPin
                className="w-full"
                color={`${urlNow.pathname === "/location-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Location List</p>
          </div>

          {/* Category */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/category-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/category-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <Clipboard
                className="w-full"
                color={`${urlNow.pathname === "/category-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Category List</p>
          </div>

          {/* Sub Category */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/sub-category-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/sub-category-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <ClipboardType
                className="w-full"
                color={`${urlNow.pathname === "/sub-category-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Sub Category List</p>
          </div>

          {/* Discount */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/discount-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/discount-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <Percent
                className="w-full"
                color={`${urlNow.pathname === "/discount-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Discount</p>
          </div>

          {/* Shift */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/shift-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/shift-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <AlarmClock
                className="w-full"
                color={`${urlNow.pathname === "/shift-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Shift</p>
          </div>

          {/* List Product Admin */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/product-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/product-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <UtensilsCrossed
                className="w-full"
                color={`${urlNow.pathname === "/product-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Product List</p>
          </div>

          {/* MemberShip List Admin */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/member-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/member-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <BookUser
                className="w-full"
                color={`${urlNow.pathname === "/member-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>MemberShip List</p>
          </div>

          {/* Type Payment */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/type-payment-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/type-payment-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <Wallet
                className="w-full"
                color={`${urlNow.pathname === "/type-payment-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>Type Payment List</p>
          </div>
        </div>
      );
    }

    if (user.userType === "user") {
      return (
        <div className="flex flex-col gap-8">
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/home")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/home" ? "bg-[#6853F0]" : "bg-[#ffcf40]"} rounded-full`}>
              <ShoppingBasketIcon
                className="w-full"
                color={`${urlNow.pathname === "/home" ? "#ffcf40" : "#fff"}`}
              />
            </div>
            <p className={classNameContainer}>Kembali Ke Cashier App</p>
          </div>

          {/* User List */}
          <div
            className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
            onClick={() => navigate("/member-list")}>
            <div
              className={`w-14 h-14 p-4 ${urlNow.pathname === "/member-list" ? "bg-[#6853F0]" : "bg-[#D9D9D9]"} rounded-full`}>
              <BookUser
                className="w-full"
                color={`${urlNow.pathname === "/member-list" ? "#fff" : "#000"}`}
              />
            </div>
            <p className={classNameContainer}>MemberShip List</p>
          </div>
        </div>
      );
    }
  }, [user, classNameContainer]);

  return (
    <div className="flex flex-col items-center my-6 gap-14">
      <div className="w-10 h-10" onClick={() => navigate("/home")}>
        <img src={LogoSidebar} alt="logo-sidebar" className="object-cover w-full cursor-pointer" />
      </div>
      {MENU_LIST}
    </div>
  );
};

SideBarMenu.defaultProps = {
  classNameContainer: "",
  user: {}
};

SideBarMenu.propTypes = {
  classNameContainer: PropTypes.string,
  user: PropTypes.object
};

export default SideBarMenu;
