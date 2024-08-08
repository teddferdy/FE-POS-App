import React from "react";
import ProfileHeader from "../profile-header";
import Avatar from "../../atom/avatar";
import Dropdown from "../../atom/dropdown";
import PropTypes from "prop-types";

// Assets
import BurgerOpenIconBar from "../../../assets/burger-open.png";
import BurgerCloseIconBar from "../../../assets/burger-close.png";

const HeaderHome = ({
  listMenuProfile,
  listTranslation,
  translationName,
  translationImg,
  updateTranslation,
  selecDataProfile,
  search,
  setSearch,
  openMenu,
  openingSideBar
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-lg">
      <div className={`flex flex-1 items-center gap-4 ${openingSideBar ? "ml-72" : "md:ml-28"}`}>
        <button onClick={openMenu} className="hidden md:block w-8 h-8">
          <img
            src={openingSideBar ? BurgerCloseIconBar : BurgerOpenIconBar}
            alt="icon burger"
            className="object-cover w-full"
          />
        </button>
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
        <Dropdown data={listTranslation} selectData={(select) => updateTranslation(select)}>
          <button className="text-gray-700 font-semibold rounded inline-flex items-center justify-center">
            <div className="w-8 h-8">
              <img src={translationImg} alt={translationName} className="object-cover" />
            </div>
          </button>
        </Dropdown>
        <ProfileHeader name="John" placeCashier="Bonta Coffe" />
        <Dropdown
          data={listMenuProfile}
          classNameListContainer="right-0"
          widthListWrapper="w-52"
          selectData={selecDataProfile}>
          <Avatar />
        </Dropdown>
      </div>
    </div>
  );
};

HeaderHome.propTypes = {
  listMenuProfile: PropTypes.array,
  listTranslation: PropTypes.array,
  translationName: PropTypes.any,
  translationImg: PropTypes.any,
  updateTranslation: PropTypes.any,
  selecDataProfile: PropTypes.any,
  search: PropTypes.any,
  setSearch: PropTypes.any,
  openMenu: PropTypes.any,
  openingSideBar: PropTypes.bool
};

export default HeaderHome;
