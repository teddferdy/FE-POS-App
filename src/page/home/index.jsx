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

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";

const arr = Array(20).fill(null);

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
    <div className="flex h-screen relative max-w-full">
      <div className="bg-white hidden md:block transition-all z-10 shadow-2xl group absolute h-screen w-24 md:hover:w-fit md:hover:px-10 rounded-r-3xl">
        <SideBar classNameContainer="hidden group-hover:block transition-all" />
      </div>
      <div className="flex flex-1 flex-col">
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
        <div className="flex h-screen border-t-2 border-[#ffffff10] md:pl-20">
          <div className="flex-1 overflow-hidden py-10 flex-col flex bg-gray-200">
            <Swiper
              slidesPerView={6}
              spaceBetween={20}
              freeMode={true}
              // pagination={{
              //   clickable: true
              // }}
              modules={[FreeMode, Pagination]}
              className="flex overflow-x-auto gap-10 pl-10 no-scrollbar max-w-6xl pb-9">
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
              <SwiperSlide className="rounded-full flex items-center justify-center py-6 font-bold text-[#CECECE] text-base bg-white">
                Semua
              </SwiperSlide>
            </Swiper>
            <div className="grid grid-cols-2  md:grid-cols-3 overflow-scroll flex-wrap gap-4 h-screen no-scrollbar px-12 pb-20">
              {arr.map((_, index) => {
                return (
                  <div className="p-2 rounded-lg flex flex-col gap-4 bg-white" key={index}>
                    <img
                      src="https://asset.kompas.com/crops/MrdYDsxogO0J3wGkWCaGLn2RHVc=/84x60:882x592/750x500/data/photo/2021/11/17/61949959e07d3.jpg"
                      alt="img"
                      className="object-cover w-full h-48 rounded-lg"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-[#737373] font-bold text-base">Nasi Goreng</p>
                      <p className="text-[#737373] text-sm w-4/5">
                        Nasi + Telur + Sapi + Bumbu special
                      </p>
                      <p className="text-[#737373] font-bold text-base">Rp. 12.000</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[#CECECE] text-sm">Masukan Jumlah :</p>
                      <div className="flex justify-between items-center">
                        <button className="flex-1 py-1 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                          -
                        </button>
                        <div className="flex-1 text-black font-bold text-lg text-center">2</div>
                        <button className="flex-1 py-1 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                          +
                        </button>
                      </div>
                    </div>
                    <button className="w-full h-6 py-6 text-xs font-bold rounded-md flex items-center justify-center bg-[#6853F0] text-white">
                      Masukan Keranjang
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex md:flex-[0.4] shadow-lg py-12 px-8  flex-col justify-between gap-6 bg-white">
            <h3 className="text-2xl font-semibold text-[#737373]">Jumlah Orderan :</h3>
            <div className="overflow-scroll h-screen no-scrollbar flex-1 flex flex-col gap-4">
              {arr.map((_, index) => {
                return (
                  <div className="flex gap-4 border-b border-[#000] pb-4" key={index}>
                    <div className="flex gap-4 flex-1 items-center">
                      <div className="w-30 h-20">
                        <img
                          src="https://asset.kompas.com/crops/MrdYDsxogO0J3wGkWCaGLn2RHVc=/84x60:882x592/750x500/data/photo/2021/11/17/61949959e07d3.jpg"
                          alt="img"
                          className="object-cover w-full h-full rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <p className="text-[#737373] font-semibold text-base">Nasi Goreng</p>
                        <p className="text-[#6853F0] font-semibold text-base">Rp. 24.000</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 justify-center items-center">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                        -
                      </button>
                      <div className="text-black font-bold text-lg">2</div>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="self-end flex-[0.4] w-full border-t border-[#D9D9D9] flex flex-col gap-4">
              <div className="flex justify-between items-center pt-4">
                <p className="text-[#737373] text-lg font-semibold">Total :</p>
                <p className="text-[#737373] text-lg font-semibold">Rp 60.000</p>
              </div>
              <div className="flex justify-between items-center">
                <button className="px-3 py-2 bg-[#D9D9D9] text-base font-bold text-white rounded-full">
                  Custom Nota
                </button>
                <button className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full">
                  Print Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
