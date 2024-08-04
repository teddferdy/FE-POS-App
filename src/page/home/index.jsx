import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderHome from "../../components/molecule/header-home";
// import Card from "../../components/atom/card";

// Assets
import HomeProfileIcons from "../../assets/icon/home-icon.svg";
import SettingProfileIcons from "../../assets/icon/settings-profile-icon.svg";

// Zustand
import { translationSelect } from "../../state/translation";

// Utils -> Constant
import { TRANSLATION } from "../../utils/translation";
import SideBar from "../../components/molecule/sidebar";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";

const Home = () => {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { translationName, translationImg, updateTranslation } = translationSelect();

  const LIST_MENU_PROFILE = [
    {
      name: "Account Setting",
      value: "setting-profile",
      img: HomeProfileIcons
    },
    {
      name: "Logout",
      value: "/",
      img: SettingProfileIcons
    }
  ];

  const selectedByProfile = ({ value }) => {
    navigate(value);
  };

  return (
    <div className="flex h-screen overflow-hidden relative max-w-full">
      <div className="bg-white transition-all z-10 shadow-lg group absolute h-screen w-24 md:hover:w-fit md:hover:px-10">
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
        <div className="flex h-screen border-t-2 border-[#ffffff10] pl-20">
          <div className="flex-1 overflow-hidden py-10 flex-col gap-20 flex bg-gray-200">
            <div className="flex overflow-x-auto gap-10 pl-10 no-scrollbar max-w-6xl">
              <Swiper
                slidesPerView={6}
                spaceBetween={10}
                freeMode={true}
                // pagination={{
                //   clickable: true
                // }}
                modules={[FreeMode, Pagination]}
                className="mySwiper pb-9">
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button className="py-4 px-8 rounded-full font-bold text-[#CECECE] text-base bg-white">
                    Semua
                  </button>
                </SwiperSlide>
              </Swiper>
            </div>
            <div className="grid grid-cols-3 overflow-scroll flex-wrap gap-20 h-screen no-scrollbar px-24">
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
