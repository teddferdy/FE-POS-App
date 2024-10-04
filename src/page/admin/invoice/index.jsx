import React from "react";
import { ChevronDown } from "lucide-react";
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

const index = () => {
  const navigate = useNavigate();
  return (
    <TemplateContainer>
      <div className="flex flex-col justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Invoice Page</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
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
            <AccordionTrigger>Invoice Logo</AccordionTrigger>
            <AccordionContent>
              <div
                className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
                onClick={() => {
                  navigate("/logo-invoice-list");
                }}>
                <div className="mb-4 text-4xl">🐋</div>
                <h2 className="text-2xl font-bold mb-2">Invoice Logo</h2>
                <p>
                  Select a plan that best suits your needs. We offer multiple options for every kind
                  of user.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2 */}
          <AccordionItem value="step2">
            <AccordionTrigger>Invoice Social Media</AccordionTrigger>
            <AccordionContent className="p-6 mb-6">
              <StepFlow />
            </AccordionContent>
          </AccordionItem>

          {/* Step 3 */}
          <AccordionItem value="step3">
            <AccordionTrigger>Invoice Footer</AccordionTrigger>
            <AccordionContent>
              <div
                className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white"
                onClick={() => {
                  navigate("/footer-invoice-list");
                }}>
                <div className="mb-4 text-4xl">🐋</div>
                <h2 className="text-2xl font-bold mb-2">Invoice Footer</h2>
                <p>
                  Select a plan that best suits your needs. We offer multiple options for every kind
                  of user.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </TemplateContainer>
  );
};

export default index;
