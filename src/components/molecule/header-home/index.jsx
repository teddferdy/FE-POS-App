import React from "react";
import Input from "../../atom/input";
import ProfileHeader from "../profile-header";
import Avatar from "../../atom/avatar";
import Dropdown from "../../atom/dropdown";

const HeaderHome = ({
  listMenuProfile,
  listTranslation,
  translationName,
  translationImg,
  updateTranslation,
  selecDataProfile,
  search,
  setSearch,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-lg">
      <div className="flex-1">
        <Input
          placeholder="Cari...."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          id="search"
          name="search"
          classNameInput="h-10 max-w-[350px]"
        />
      </div>
      <div className="flex flex-1 items-end justify-end gap-10">
        <Dropdown
          data={listTranslation}
          selectData={(select) => updateTranslation(select)}
        >
          <button className="text-gray-700 font-semibold rounded inline-flex items-center justify-center">
            <div className="w-8 h-8">
              <img
                src={translationImg}
                alt={translationName}
                className="object-cover"
              />
            </div>
          </button>
        </Dropdown>
        <ProfileHeader name="John" placeCashier="Bonta Coffe" />
        <Dropdown
          data={listMenuProfile}
          classNameListContainer="right-0"
          widthListWrapper="w-52"
          selectData={selecDataProfile}
        >
          <Avatar />
        </Dropdown>
      </div>
    </div>
  );
};

export default HeaderHome;
