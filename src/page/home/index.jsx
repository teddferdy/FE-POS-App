import React, { useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "../../components/ui/resizable";
import AvatarUser from "../../components/molecule/AvatarUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../components/ui/select";

// Import Swiper React components
import { Menu, Check, ChevronsUpDown } from "lucide-react";

import SideBar from "../../components/molecule/sidebar";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "../../components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../../components/ui/sheet";

import { cn } from "../../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "../../components/ui/drawer";

// Form

import DialogCheckout from "../../components/molecule/dialog/dialogCheckout";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { FreeMode, Pagination } from "swiper/modules";
import { translationSelect } from "../../state/translation";
import { TRANSLATION } from "../../utils/translation";

const arr = Array(40).fill(null);

const filteringBy = [
  {
    value: "asc",
    label: "Harga Terendah"
  },
  {
    value: "desc",
    label: "Harga Tertinggi"
  },
  {
    value: "promo",
    label: "Promo"
  },
  {
    value: "Event",
    label: "Event"
  }
];

const filteringByCategory = [
  {
    value: "Semua",
    label: "Semua"
  },
  {
    value: "Makanan",
    label: "Makanan"
  },
  {
    value: "Minuman",
    label: "Minuman"
  },
  {
    value: "Snack",
    label: "Snack"
  },
  {
    value: "Seafood",
    label: "Seafood"
  }
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  // FIlter By
  const [openFilterBy, setOpenFilterBy] = useState(false);
  const [valueFilterBy, setValueFilterBy] = useState("");

  // Filter Category
  const [openFilterCategory, setOpenFilterCategory] = useState(false);
  const [valueFilterCategory, setValueFilterCategory] = useState("");

  const { updateTranslation, translation } = translationSelect();

  return (
    <ResizablePanelGroup direction="horizontal" className="overflow-hidden h-screen">
      <ResizablePanel
        onResize={(props) => {
          if (props > 12) {
            setOpenMenu(true);
          } else {
            setOpenMenu(false);
          }
        }}
        defaultSize={4}
        maxSize={16}
        minSize={6}
        className="hidden overflow-hidden h-screen lg:block">
        <SideBar classNameContainer={`${openMenu ? "block" : "hidden"}`} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} className="overflow-hidden h-screen">
        <div className="flex items-center justify-between p-4 bg-white shadow-lg">
          <div className="flex flex-1 items-center gap-4 lg:gap-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none lg:hidden">
                  <Menu color="#6853F0" className="w-6 h-6 cursor-pointer" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/6">
                <SideBar classNameContainer="block" />
              </SheetContent>
            </Sheet>
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
          <div className="flex flex-[0.2] md:flex-1 items-end justify-end gap-10">
            <div className="hidden md:block">
              <Select
                onValueChange={(e) => updateTranslation(e)}
                value={localStorage.getItem("translation")}>
                <SelectTrigger className="w-fit border-hidden">
                  {TRANSLATION?.filter((items) => items.value === translation)?.map(
                    (items, index) => (
                      <img
                        src={items.img}
                        alt={items.name}
                        className="max-w-6 max-h-6"
                        key={index}
                      />
                    )
                  )}
                </SelectTrigger>
                <SelectContent
                  className="min-w-2 z-50"
                  defaultValue={
                    TRANSLATION?.filter((items) => items.value === translation)?.map(
                      (items) => items.value
                    )?.[0]
                  }>
                  <SelectGroup>
                    <SelectLabel>Select Language</SelectLabel>
                    {TRANSLATION.map((items, index) => (
                      <SelectItem
                        value={items.value}
                        className="w-full flex items-center"
                        key={index}>
                        <div className="flex justify-between items-center gap-4">
                          <img src={items.img} alt={items.name} className="max-w-6 max-h-6" />
                          <p>{items.name}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden md:flex md:flex-col md:gap-1">
              <p className="text-base font-medium text-[#737373]">welcome, John!</p>
              <p className="text-xs font-medium text-[#D9D9D9]">Cashier on Bonta Coffe</p>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none">
                  <AvatarUser />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Hello, John</SheetTitle>
                  <SheetDescription>Cashier on Bonta Coffe</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div htmlFor="name" className="text-right">
                      Name
                    </div>
                    <input id="name" value="Pedro Duarte" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div htmlFor="username" className="text-right">
                      Username
                    </div>
                    <input id="username" value="@peduarte" className="col-span-3" />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex h-screen border-t-2 border-[#ffffff10] relative">
          <div className="flex-1 overflow-hidden py-10 flex-col flex bg-gray-200 h-screen px-4">
            {/* Slider Category When Desktop Resolution */}
            <Swiper
              slidesPerView={6}
              spaceBetween={20}
              freeMode={true}
              modules={[FreeMode, Pagination]}
              className="overflow-x-auto gap-10 no-scrollbar max-w-6xl pb-9 pr-96 hidden lg:flex">
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

            {/* Filter Category When In Tablet / Mobile Resolution */}
            <div className="lg:hidden flex justify-between items-center mb-10 gap-20">
              <div className="flex flex-col gap-4 flex-1">
                <p>Filter By</p>

                <Popover open={openFilterBy} onOpenChange={setOpenFilterBy}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openFilterBy}
                      className="w-full justify-between">
                      {valueFilterBy
                        ? filteringBy.find((filteringBy) => filteringBy.value === valueFilterBy)
                            ?.label
                        : "Filter..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search filteringBy..." />
                      <CommandList>
                        <CommandEmpty>No filter By found.</CommandEmpty>
                        <CommandGroup>
                          {filteringBy.map((filteringBy) => (
                            <CommandItem
                              key={filteringBy.value}
                              value={filteringBy.value}
                              onSelect={(currentValue) => {
                                setValueFilterBy(
                                  currentValue === valueFilterBy ? "" : currentValue
                                );
                                setOpenFilterBy(false);
                              }}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  valueFilterBy === filteringBy.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {filteringBy.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <p>Category By</p>

                <Popover open={openFilterCategory} onOpenChange={setOpenFilterCategory}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openFilterCategory}
                      className="w-full justify-between">
                      {valueFilterCategory
                        ? filteringByCategory.find(
                            (filteringByCategory) =>
                              filteringByCategory.value === valueFilterCategory
                          )?.label
                        : "Category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search Category..." />
                      <CommandList>
                        <CommandEmpty>No Category found.</CommandEmpty>
                        <CommandGroup>
                          {filteringByCategory.map((filteringByCategory) => (
                            <CommandItem
                              key={filteringByCategory.value}
                              value={filteringByCategory.value}
                              onSelect={(currentValue) => {
                                setValueFilterCategory(
                                  currentValue === valueFilterCategory ? "" : currentValue
                                );
                                setOpenFilterCategory(false);
                              }}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  valueFilterCategory === filteringByCategory.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {filteringByCategory.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Total Checkout Table / Mobile */}
            <div
              className={`w-full  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 fixed px-4 left-0 bottom-0 z-10 bg-white lg:hidden`}>
              <div className="flex justify-between items-center">
                <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
                <p className="text-[#737373] text-lg font-semibold">Rp 60.000</p>
              </div>
              <div className="flex justify-between items-center">
                <button className="px-3 py-2 bg-[#D9D9D9] text-base font-bold text-white rounded-full">
                  Custom Nota
                </button>
                <div className="flex items-center gap-10">
                  <DialogCheckout />
                  <Drawer>
                    <DrawerTrigger>
                      <button className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full">
                        Check Detail
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[80vh]">
                      <DrawerHeader>
                        <DrawerTitle>Daftar Orderan</DrawerTitle>
                      </DrawerHeader>
                      <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
                        {arr.map((_, index) => {
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
                                  <p className="text-[#737373] font-semibold text-base">
                                    Nasi Goreng
                                  </p>
                                  <p className="text-[#6853F0] font-semibold text-base">
                                    Rp. 24.000
                                  </p>
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
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="grid grid-cols-2  md:grid-cols-3 overflow-scroll flex-wrap gap-4 h-screen no-scrollbar pb-20">
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

          {/* Total Checkout */}
          <div className="hidden lg:flex md:flex-[0.4] shadow-lg py-12 flex-col justify-between gap-6 bg-white relative">
            <h3 className="text-2xl font-semibold text-[#737373] px-8">Daftar Orderan :</h3>
            <div className="overflow-scroll h-auto no-scrollbar flex-1 flex flex-col gap-4 px-8">
              {arr.map((_, index) => {
                console.log("index", index);
                console.log("arr.length", arr.length);

                return (
                  <div
                    className={`flex gap-4 border-b border-[#000]  ${index + 1 === arr.length ? "pb-56" : "pb-4"}`}
                    key={index}>
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

            <div
              className={`${!openMenu ? "w-[27%]" : "w-[24%]"}  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 px-8 fixed bottom-0 z-10 bg-white`}>
              <div className="flex justify-between items-center">
                <p className="text-[#737373] text-lg font-semibold">Total Items :</p>
                <p className="text-[#737373] text-lg font-semibold">40 Items</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
                <p className="text-[#737373] text-lg font-semibold">Rp 60.000</p>
              </div>
              <div className="flex justify-between items-center">
                <button className="px-3 py-2 bg-[#D9D9D9] text-base font-bold text-white rounded-full">
                  Custom Nota
                </button>

                {/* Dialog Checkout  */}
                <DialogCheckout />
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Home;
