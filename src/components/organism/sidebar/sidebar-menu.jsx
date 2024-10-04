import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";

// Assets
import LogoSidebar from "../../../assets/logo-sidebar.png";

import { cn } from "../../../lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { buttonVariants } from "../../ui/button";
import { sidebarMenuAdmin, sidebarMenuUser } from "../../../utils/sidebar-menu";

const SideBarMenu = ({ classNameContainer, user }) => {
  const navigate = useNavigate();

  const MENU_LIST = useMemo(() => {
    if (user.userType === "admin") {
      return (
        <>
          {sidebarMenuAdmin?.length ? (
            <nav className="flex flex-col gap-6">
              {sidebarMenuAdmin?.map((item, index) =>
                item.children ? (
                  <Accordion type="single" collapsible key={index}>
                    <AccordionItem value={item.title} className="border-b-0">
                      {item.href ? (
                        <Link to={item.href} className="block py-1 hover:text-blue-500">
                          <AccordionTrigger
                            className={cn(
                              buttonVariants({
                                size: "sm",
                                variant: "ghost"
                              }),
                              "justify-between",
                              item.disabled && "cursor-not-allowed opacity-80"
                            )}>
                            {item.title}
                          </AccordionTrigger>
                        </Link>
                      ) : (
                        <AccordionTrigger
                          className={cn(
                            buttonVariants({
                              size: "sm",
                              variant: "ghost"
                            }),
                            "justify-between",
                            item.disabled && "cursor-not-allowed opacity-80"
                          )}>
                          <div className="flex items-center justify-start">
                            {item.icon && (
                              <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                            )}
                            {item.title}
                          </div>
                        </AccordionTrigger>
                      )}
                      <AccordionContent>
                        <div className="ml-7 flex flex-col space-y-1">
                          {item.children.map((child, index) => (
                            <div
                              onClick={() => navigate(child.href)}
                              key={index}
                              className={cn(
                                buttonVariants({
                                  size: "sm",
                                  variant: "ghost"
                                }),
                                "justify-start",
                                child.disabled && "cursor-not-allowed opacity-80"
                              )}>
                              {child.title}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  item.href && (
                    <div
                      onClick={() => navigate(item.href)}
                      key={index}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: "ghost"
                        }),
                        "justify-start",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )}>
                      {item.icon && (
                        <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      {item.title}
                    </div>
                  )
                )
              )}
            </nav>
          ) : null}
        </>
      );
    }

    if (user.userType === "user") {
      return (
        <>
          {sidebarMenuUser?.length ? (
            <nav className="flex flex-col gap-6">
              {sidebarMenuAdmin?.map((item, index) =>
                item.children ? (
                  <Accordion type="single" collapsible key={index}>
                    <AccordionItem value={item.title} className="border-b-0">
                      <AccordionTrigger
                        className={cn(
                          buttonVariants({
                            size: "sm",
                            variant: "ghost"
                          }),
                          "justify-between",
                          item.disabled && "cursor-not-allowed opacity-80"
                        )}>
                        <div className="flex items-center justify-start">
                          {item.icon && (
                            <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                          )}
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ml-7 flex flex-col space-y-1">
                          {item.children.map((child, index) => (
                            <div
                              onClick={() => navigate(child.href)}
                              key={index}
                              className={cn(
                                buttonVariants({
                                  size: "sm",
                                  variant: "ghost"
                                }),
                                "justify-start",
                                child.disabled && "cursor-not-allowed opacity-80"
                              )}>
                              {child.title}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  item.href && (
                    <div
                      onClick={() => navigate(item.href)}
                      key={index}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: "ghost"
                        }),
                        "justify-start",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )}>
                      {item.icon && (
                        <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      {item.title}
                    </div>
                  )
                )
              )}
            </nav>
          ) : null}
        </>
      );
    }
  }, [user, classNameContainer]);

  return (
    <div className="flex flex-col my-6 gap-14">
      <div className="flex justify-center" onClick={() => navigate("/home")}>
        <img
          src={LogoSidebar}
          alt="logo-sidebar"
          className=" w-10 h-10 object-coverc cursor-pointer"
        />
      </div>
      {MENU_LIST}
    </div>
  );
};

SideBarMenu.defaultProps = {
  classNameContainer: "",
  user: {}
};

SideBarMenu.propTypes = {
  classNameContainer: PropTypes.string,
  user: PropTypes.object
};

export default SideBarMenu;
