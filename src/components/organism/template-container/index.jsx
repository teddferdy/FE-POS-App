import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import SideBarMenu from "../sidebar/sidebar-menu";
import SideBarProfile from "../sidebar/sidebar-profile";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import AvatarUser from "../avatar-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../ui/select";

// Import Swiper React components
import { Menu, ArrowBigLeft } from "lucide-react";

import { Button } from "../../ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../../ui/sheet";
import { translationSelect } from "../../../state/translation";
import { TRANSLATION } from "../../../utils/translation";
import { logOut } from "../../../services/auth";
import { useLoading } from "../loading";

import { urlWithArrowBack } from "../../../utils/sidebar-menu";

const TemplateContainer = ({ children, rootContainer, childrenContainer }) => {
  const { setActive } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();

  const { updateTranslation, translation } = translationSelect();

  const [openSheet, setOpenSheet] = useState(false);
  const [search, setSearch] = useState("");
  const [cookie] = useCookies(["user"]);

  // Query
  const mutateLogout = useMutation(logOut, {
    retry: 2,
    onMutate: () => {
      setActive(true, null);
      setOpenSheet(false);
    },
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Logout successfully"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Logout", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const arrowBackButton = urlWithArrowBack?.find((items) => {
    return items?.pathName === location?.pathname;
  });

  // Side Mobile
  const SIDEBAR_MOBILE = useMemo(() => {
    if (cookie?.user) {
      return <SideBarMenu classNameContainer="block" user={cookie?.user || {}} />;
    }
  }, [cookie]);

  const SIDEBAR_PROFILE = useMemo(() => {
    if (cookie?.user) {
      return (
        <SideBarProfile
          navigate={navigate}
          mutateLogout={() => mutateLogout.mutate({ id: cookie?.user?.id })}
        />
      );
    }
  }, [mutateLogout, navigate, cookie]);

  return (
    <ResizablePanelGroup direction="horizontal" className={rootContainer}>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} className={childrenContainer}>
        <div className="flex items-center justify-between p-4 bg-white shadow-lg fixed w-full z-10">
          <div className="flex flex-1 items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none">
                  <Menu color="#6853F0" className="w-6 h-6 cursor-pointer" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/6 overflow-scroll h-screen no-scrollbar">
                {SIDEBAR_MOBILE}
              </SheetContent>
            </Sheet>
            {arrowBackButton ? (
              <div className="flex items-center gap-4">
                <div
                  className="p-2 bg-[#6853F0] rounded-md cursor-pointer"
                  onClick={() => navigate(arrowBackButton.url)}>
                  <ArrowBigLeft height={30} color="#fff" />
                </div>
                <p className="text-[#6853F0] text-base font-bold">{arrowBackButton.title}</p>
              </div>
            ) : (
              <input
                placeholder="Cari...."
                className="w-full p-2 border-2 border-[#C5C5C5] rounded-full outline-none focus:bg-gray-300"
                type="text"
                id="search"
                name="search"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            )}
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
              <p className="text-base font-medium text-[#737373]">
                welcome, {cookie?.user?.userName}!
              </p>
              <p className="text-xs font-medium text-[#D9D9D9]">
                Cashier on {cookie?.user?.location}
              </p>
            </div>

            <Sheet open={openSheet} onOpenChange={() => setOpenSheet(!openSheet)}>
              <SheetTrigger onClick={() => setOpenSheet(!openSheet)}>
                <Button variant="outline" className="p-0 bg-transparent border-none">
                  <AvatarUser />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Hello, {cookie?.user?.userName}!</SheetTitle>
                  <SheetDescription>Cashier on {cookie?.user?.location}</SheetDescription>
                </SheetHeader>
                {SIDEBAR_PROFILE}
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="mt-[75px]">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

TemplateContainer.propTypes = {
  children: PropTypes.element,
  rootContainer: PropTypes.string,
  childrenContainer: PropTypes.string
};

export default TemplateContainer;
