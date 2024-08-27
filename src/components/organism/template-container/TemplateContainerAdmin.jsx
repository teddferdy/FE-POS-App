import React, { useState } from "react";
import PropTypes from "prop-types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import SidebarAdmin from "../../molecule/sidebarAdmin";

import AvatarUser from "../../molecule/AvatarUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../ui/select";

// Import Swiper React components
import { Menu } from "lucide-react";

import SideBar from "../../molecule/sidebar";

import { Button } from "../../ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../../ui/sheet";
import { translationSelect } from "../../../state/translation";
import { TRANSLATION } from "../../../utils/translation";

const TemplateContainerAdmin = ({ children }) => {
  const { updateTranslation, translation } = translationSelect();
  const [openMenu, setOpenMenu] = useState(false);
  const [search, setSearch] = useState("");
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
        <SidebarAdmin classNameContainer={`${openMenu ? "block" : "hidden"}`} />
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
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

TemplateContainerAdmin.propTypes = {
  children: PropTypes.element
};

export default TemplateContainerAdmin;
