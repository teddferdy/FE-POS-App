import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
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
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu";
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

  const [search, setSearch] = useState("");
  const [cookie] = useCookies(["user"]);

  const [openSidebar, setOpenSidebar] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  // Query
  const mutateLogout = useMutation(logOut, {
    retry: 2,
    onMutate: () => {
      setActive(true, null);
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
    const split = location.pathname.split("/");
    const pathNme = split?.[1];

    return items?.pathName === `/${pathNme}`;
  });

  // Side Mobile
  const SIDEBAR_MOBILE = useMemo(() => {
    if (cookie?.user) {
      return (
        <SideBarMenu
          classNameContainer="block"
          user={cookie?.user || {}}
          handleNavigate={(val) => {
            navigate(val);
            setOpenSidebar(false);
          }}
        />
      );
    }
  }, [cookie]);

  const SIDEBAR_PROFILE = useMemo(() => {
    if (cookie?.user) {
      return (
        <SideBarProfile
          navigate={navigate}
          mutateLogout={() => {
            mutateLogout.mutate({
              userName: cookie.user.userName,
              email: cookie.user.email,
              store: cookie.user.store
            });
            setOpenLogout(false);
          }}
        />
      );
    }
  }, [mutateLogout, navigate, cookie]);

  return (
    <ResizablePanelGroup direction="horizontal" className={rootContainer}>
      <ResizablePanel defaultSize={55} className={childrenContainer}>
        <div className="flex items-center justify-between p-4 bg-white shadow-lg fixed w-full z-10">
          <div className="flex flex-1 items-center gap-4">
            <Sheet
              open={openSidebar}
              onOpenChange={(val) => {
                setOpenSidebar(val);
              }}>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none">
                  <Menu color="#6853F0" className="w-6 h-6 cursor-pointer" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-fit md:w-1/3 lg:w-[20%] overflow-scroll h-screen no-scrollbar">
                {SIDEBAR_MOBILE}
              </SheetContent>
            </Sheet>
            {arrowBackButton ? (
              <div className="flex items-center gap-4">
                {arrowBackButton.url !== 0 && (
                  <div
                    className="p-2 bg-[#6853F0] rounded-md cursor-pointer"
                    onClick={() => navigate(arrowBackButton.url)}>
                    <ArrowBigLeft height={30} color="#fff" />
                  </div>
                )}
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
          <div className="flex flex-[0.2] md:flex-1 items-center justify-end gap-10">
            <div className="hidden md:block">
              <Select
                onValueChange={(e) => updateTranslation(e)}
                value={localStorage.getItem("translation")}>
                <SelectTrigger className="w-fit border-hidden flex items-center gap-2 ring-0 hover:bg-[#1ACB0A] duration-200 focus:ring-0">
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
                        className="w-full flex items-center focus:bg-[#1ACB0A] focus:text-white"
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
              {cookie?.user?.userType !== "super-admin" && (
                <p className="text-xs font-medium text-[#737373]">
                  Cashier on {cookie?.user?.storeName}
                </p>
              )}
            </div>

            <DropdownMenu
              open={openLogout}
              onOpenChange={(val) => {
                setOpenLogout(val);
              }}>
              <DropdownMenuTrigger
                className="flex items-center gap-1 ring-0 focus:bg-transparent"
                asChild>
                <Button variant="outline" className="p-0 bg-transparent border-none">
                  <AvatarUser />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                <div className="p-4">{SIDEBAR_PROFILE}</div>
              </DropdownMenuContent>
            </DropdownMenu>
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
