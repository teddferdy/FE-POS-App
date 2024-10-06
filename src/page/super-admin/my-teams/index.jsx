import React from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "react-query";
import TemplateContainer from "../../../components/organism/template-container";
// import StepFlow from "../../../components/organism/step/product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../components/ui/dropdown-menu";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "../../../components/ui/accordion";
import { Card } from "../../../components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
// import StepFlow from "../../../components/organism/step/invoice-social-media";
import { useNavigate } from "react-router-dom";

import DialogLocationList from "../../../components/organism/dialog/dialog-location-list";
import { getAllLocation } from "../../../services/location";

const index = () => {
  const navigate = useNavigate();

  const allLocation = useQuery(["get-all-location-card"], () => getAllLocation(), {
    retry: 0,
    keepPreviousData: true
  });

  return (
    <TemplateContainer>
      <div className="flex flex-col justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">My Teams</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/overview">Admin Menu</BreadcrumbLink>
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
        <Accordion type="single" collapsible defaultValue="step1">
          {/* Step 1 */}
          <AccordionItem value="step1">
            <AccordionTrigger>User</AccordionTrigger>
            <AccordionContent>
              <DialogLocationList
                allLocation={allLocation}
                handleLocation={(location) => {
                  navigate("/my-teams-user", {
                    state: {
                      location: location.nameStore
                    }
                  });
                }}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Step 2 */}
          <AccordionItem value="step2">
            <AccordionTrigger>Position</AccordionTrigger>
            <AccordionContent>
              <Card
                className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
                onClick={() => {
                  navigate("/position-list");
                }}>
                <div className="mb-4 text-4xl">🌐</div>
                <h2 className="text-2xl font-bold mb-2">Position</h2>
                <p>Description Position Job</p>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Step 3 */}
          <AccordionItem value="step3">
            <AccordionTrigger>Role</AccordionTrigger>
            <AccordionContent>
              <Card
                className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
                onClick={() => {
                  navigate("/role-list");
                }}>
                <div className="mb-4 text-4xl">🌐</div>
                <h2 className="text-2xl font-bold mb-2">Role</h2>
                <p>Description Role Job</p>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </TemplateContainer>
  );
};

export default index;
