import React from "react";
import { ChevronDown } from "lucide-react";
import TemplateContainer from "../../../components/organism/template-container";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";

import DialogViewInvoiceByLocation from "../../../components/organism/dialog/dialog-view-invoice-by-location";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../components/ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import StepFlow from "../../../components/organism/step/invoice-social-media";
import { useNavigate } from "react-router-dom";

import { getAllSocialMedia } from "../../../services/social-media";

const index = () => {
  const navigate = useNavigate();

  const [cookie] = useCookies(["user"]);

  const allSocialMedia = useQuery(
    ["get-all-social-media"],
    () => getAllSocialMedia({ location: cookie?.user?.location }),
    {
      retry: 0
    }
  );

  return (
    <TemplateContainer>
      <div className="flex flex-col justify-between mb-6 p-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#6853F0] text-lg font-bold">Invoice Page</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <BreadcrumbLink href="/admin-page">Dashboard</BreadcrumbLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1">
                        Invoice Menu
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>
                          <BreadcrumbLink href="/invoice-page">Invoice Page</BreadcrumbLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BreadcrumbLink href="/logo-invoice-list">Logo</BreadcrumbLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BreadcrumbLink href="/social-media-invoice-list">
                            Social Media
                          </BreadcrumbLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BreadcrumbLink href="/footer-invoice-list">Footer</BreadcrumbLink>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Step By Step Adding Product</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <DialogViewInvoiceByLocation nameStore={cookie?.user?.location} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div
            className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
            onClick={() => {
              navigate("/logo-invoice-list");
            }}>
            <h2 className="text-2xl font-bold mb-2">Invoice Logo</h2>
            <p>
              Select a plan that best suits your needs. We offer multiple options for every kind of
              user.
            </p>
          </div>

          <div className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full">
            <h2 className="text-2xl font-bold mb-2">Invoice Social Media</h2>
            <StepFlow allSocialMedia={allSocialMedia} />
          </div>

          <div
            className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
            onClick={() => {
              navigate("/footer-invoice-list");
            }}>
            <h2 className="text-2xl font-bold mb-2">Invoice Footer</h2>
            <p>
              Select a plan that best suits your needs. We offer multiple options for every kind of
              user.
            </p>
          </div>
        </div>
      </div>
    </TemplateContainer>
  );
};

export default index;
