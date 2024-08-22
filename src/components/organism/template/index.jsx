/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
// import { useNavigate } from "react-router-dom";
// import HeaderHome from "../../molecule/header-home";
// import Card from "../../components/atom/card";
// import Dropdown from "../../atom/dropdown";
// import Avatar from "../../atom/avatar";

// Assets
// import HomeProfileIcons from "../../../assets/icon/home-icon.svg";
// import SettingProfileIcons from "../../../assets/icon/settings-profile-icon.svg";

// Zustand
// import { translationSelect } from "../../../state/translation";

// Utils -> Constant
// import { TRANSLATION } from "../../../utils/translation";
// import SideBar from "../../molecule/sidebar";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules

const TemplateHome = ({ children, classNameContainer, classNameContainerSideBar }) => {
  // const [search, setSearch] = useState("");
  // const [openMenu, setOpenMenu] = useState(false);

  // const navigate = useNavigate();

  // const { translationName, translationImg, updateTranslation } = translationSelect();

  // const LIST_MENU_PROFILE = [
  //   {
  //     name: "Account Setting",
  //     value: "setting-profile",
  //     img: HomeProfileIcons
  //   },
  //   {
  //     name: "Logout",
  //     value: "/",
  //     img: SettingProfileIcons
  //   }
  // ];

  // const selectedByProfile = ({ value }) => navigate(value);

  return (
    <main className={`flex h-screen relative overscroll-none ${classNameContainer}`}>
      {/* <div
        className={`bg-white hidden md:block transition-all z-10 shadow-2xl absolute w-24 rounded-r-3xl ${openMenu ? "w-max px-10" : ""} ${classNameContainerSideBar}`}>
        <SideBar classNameContainer={`${openMenu ? "block transition-all" : "hidden"}`} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 bg-white shadow-lg">
          <div className={`flex flex-1 items-center gap-4 ${openMenu ? "ml-72" : "md:ml-28"}`}>
            <input
              placeholder="Cari...."
              className="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
              type="text"
              id="search"
              name="search"
              onChange={setSearch}
              value={search}
            />
          </div>
          <div className="flex flex-1 items-end justify-end gap-10">
            <Dropdown data={TRANSLATION} selectData={(select) => updateTranslation(select)}>
              <button className="text-gray-700 font-semibold rounded inline-flex items-center justify-center">
                <div className="w-8 h-8">
                  <img src={translationImg} alt={translationName} className="object-cover" />
                </div>
              </button>
            </Dropdown>
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium text-[#737373]">welcome, John!</p>
              <p className="text-xs font-medium text-[#D9D9D9]">Cachier on Bonta Coffe</p>
            </div>
            <Dropdown
              data={LIST_MENU_PROFILE}
              classNameListContainer="right-0"
              widthListWrapper="w-52"
              selectData={selectedByProfile}>
              <Avatar />
            </Dropdown>
          </div>
        </div>
        {children}
      </div> */}
    </main>
  );
};

TemplateHome.propTypes = {
  children: PropTypes.element,
  classNameContainer: PropTypes.string,
  classNameContainerSideBar: PropTypes.string
};

export default TemplateHome;
