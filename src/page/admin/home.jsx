import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderHome from "../../components/molecule/header-home";

// Assets
import HomeProfileIcons from "../../assets/icon/home-icon.svg";
import SettingProfileIcons from "../../assets/icon/settings-profile-icon.svg";

// Zustand
import { translationSelect } from "../../state/translation";

// Utils -> Constant
import { TRANSLATION } from "../../utils/translation";
import SideBar from "../../components/molecule/sidebar";

const Home = () => {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { translationName, translationImg, updateTranslation } =
    translationSelect();

  const LIST_MENU_PROFILE = [
    {
      name: "Account Setting",
      value: "setting-profile",
      img: HomeProfileIcons,
    },
    {
      name: "Logout",
      value: "/",
      img: SettingProfileIcons,
    },
  ];

  const selectedByProfile = ({ value }) => {
    navigate(value);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="bg-white hidden md:overflow-visible md:block flex-[0.08] md:hover:flex-[0.15] transition-all shadow-lg group">
        <SideBar classNameContainer="hidden group-hover:block transition-all" />
      </div>
      <div className="flex-1 flex-col">
        <HeaderHome
          listMenuProfile={LIST_MENU_PROFILE}
          listTranslation={TRANSLATION}
          translationName={translationName}
          translationImg={translationImg}
          updateTranslation={updateTranslation}
          search={search}
          setSearch={setSearch}
          selecDataProfile={selectedByProfile}
        />

        <div className="flex h-screen border-t-2 border-[#ffffff10]">
          <div className="flex-1 overflow-hidden p-10 flex-col gap-10 flex bg-gray-200">
            <div className="flex overflow-x-auto gap-8">
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
              <p>BROOO</p>
            </div>
            <div className="flex overflow-scroll flex-wrap gap-20 h-screen">
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
              <p>HELLO</p>
            </div>
          </div>
          <div className="flex-[0.3] bg-white shadow-lg">WORLD</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
