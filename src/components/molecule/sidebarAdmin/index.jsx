import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Assets
import LogoSidebar from "../../../assets/sidebar/logo-sidebar.png";
import LogoList from "../../../assets/sidebar/list-logo.png";
import LogoAdmin from "../../../assets/sidebar/admin-logo.png";
import LogoChart from "../../../assets/sidebar/chart-logo.png";

const SideBarAdmin = ({ classNameContainer }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center my-6 gap-14">
      <div className="w-10 h-10" onClick={() => navigate("/home")}>
        <img src={LogoSidebar} alt="logo-sidebar" className="object-cover w-full cursor-pointer" />
      </div>
      <div className="flex flex-col gap-8">
        <div
          className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
          onClick={() => navigate("/home")}>
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoList} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>Back To Cashier App</p>
        </div>
        <div
          className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
          onClick={() => navigate("/")}>
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoList} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>Product</p>
        </div>
        <div
          className="flex items-center w-full overflow-visible gap-6 cursor-pointer"
          onClick={() => navigate("/admin-page")}>
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoAdmin} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>Category</p>
        </div>
        <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoChart} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>MemberShip</p>
        </div>
        <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoChart} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>My Employeee</p>
        </div>
      </div>
    </div>
  );
};

SideBarAdmin.defaultProps = {
  classNameContainer: ""
};

SideBarAdmin.propTypes = {
  classNameContainer: PropTypes.string
};

export default SideBarAdmin;
