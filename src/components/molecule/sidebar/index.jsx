import React from "react";

// Assets
import LogoSidebar from "../../../assets/sidebar/logo-sidebar.png";
import LogoList from "../../../assets/sidebar/list-logo.png";
import LogoAdmin from "../../../assets/sidebar/admin-logo.png";
import LogoChart from "../../../assets/sidebar/chart-logo.png";

const SideBar = ({ classNameContainer }) => {
  return (
    <div className="flex flex-col justify-center items-center my-6 gap-14">
      <div className="w-10 h-10">
        <img
          src={LogoSidebar}
          alt="logo-sidebar"
          className="object-cover w-full"
        />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoList} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>List Product</p>
        </div>
        <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoAdmin} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>Admin Menu</p>
        </div>
        <div className="flex items-center w-full overflow-visible gap-6 cursor-pointer">
          <div className="w-14 h-14 p-4 bg-red-700 rounded-full">
            <img src={LogoChart} alt="logo-list" className="w-full" />
          </div>
          <p className={classNameContainer}>Chart</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
