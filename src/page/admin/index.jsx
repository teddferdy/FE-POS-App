import React, { useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "../../components/ui/resizable";
import AvatarUser from "../../components/molecule/avatarUser";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../components/ui/select";

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

import { Menu } from "lucide-react";

import OverviewProductList from "../../components/molecule/table/overviewProductList";
import OverviewMembertList from "../../components/molecule/table/overviewMemberList";
import OverviewCategoryList from "../..//components/molecule/table/overviewCategoryList";
import OverviewLocationList from "../..//components/molecule/table/overviewLocationList";

// Import Swiper React components
import SidebarAdmin from "../../components/molecule/sidebarAdmin";
import BarChartComponent from "../../components/molecule/chart/BarChartComponent";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
// import required modules
import { translationSelect } from "../../state/translation";
import { TRANSLATION } from "../../utils/translation";

const AdminPage = () => {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const { updateTranslation, translation } = translationSelect();

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
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
        <SidebarAdmin classNameContainer={`${openMenu ? "block" : "hidden"}`} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55}>
        <div className="flex items-center justify-between p-4 bg-white shadow-lg">
          <div className="flex flex-1 items-center gap-4 lg:gap-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none lg:hidden">
                  <Menu color="#6853F0" className="w-6 h-6 cursor-pointer" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/6">
                <SidebarAdmin classNameContainer="block" />
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
        <div className="border-t-2 border-[#ffffff10] p-4 flex flex-col gap-8">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  items-center gap-4">
            <div className="p-4 bg-green-400 rounded-lg flex flex-col gap-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2>Total Product :</h2>
                <p>See All</p>
              </div>
              <p>12 Product</p>
            </div>
            <div className="p-4 bg-yellow-400 rounded-lg flex flex-col gap-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2>Total Category :</h2>
                <p>See All</p>
              </div>
              <h2>12 Category</h2>
            </div>
            <div className="p-4 bg-blue-400 rounded-lg flex flex-col gap-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2>Total Outlet / Location :</h2>
                <p>See All</p>
              </div>
              <h2>12 Outlet / Location</h2>
            </div>
            <div className="p-4 bg-orange-400 rounded-lg flex flex-col gap-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2>Total Member :</h2>
                <p>See All</p>
              </div>
              <h2>12 Member</h2>
            </div>
            <div className="p-4 bg-amber-400 rounded-lg flex flex-col gap-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2>Total Employee :</h2>
                <p>See All</p>
              </div>
              <h2>12 Employee</h2>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 shadow-lg w-full h-96 rounded-lg flex flex-col gap-4">
            <h1>Chart</h1>
            <BarChartComponent />
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2>Member List :</h2>
                <p>See All</p>
              </div>
              <OverviewMembertList />
            </div>
            <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2>Category List :</h2>
                <p>See All</p>
              </div>
              <OverviewCategoryList />
            </div>
            <div className="p-4 shadow-lg w-full flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2>Location List :</h2>
                <p>See All</p>
              </div>
              <OverviewLocationList />
            </div>
          </div>
          <div className="p-4 shadow-lg w-full h-96 rounded-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2>Product List :</h2>
              <p>See All</p>
            </div>
            <OverviewProductList />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default AdminPage;
