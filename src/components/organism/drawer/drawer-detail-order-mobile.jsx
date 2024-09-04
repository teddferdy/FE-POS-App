/* eslint-disable react/prop-types */
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";

const DrawerDetailOrderMobile = ({ order }) => {
  return (
    <Drawer>
      <DrawerTrigger>
        <button className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full">
          Order List
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Daftar Orderan</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
          {order?.map((_, index) => {
            return (
              <div className={`flex gap-4 border-b border-[#000]  pb-4`} key={index}>
                <p>{index + 1}.</p>
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
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerDetailOrderMobile;
