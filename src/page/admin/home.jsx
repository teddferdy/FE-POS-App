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
    <div className="flex h-screen">
      <div className="bg-red-500 hidden md:block flex-[0.1] md:hover:flex-[0.2] transition-all">
        Sidebar
      </div>
      <div className="flex-1 bg-orange-900">
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
      </div>
    </div>
  );
};

export default Home;
