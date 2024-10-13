import React from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";

import TemplateContainer from "../../../components/organism/template-container";
import StepFlow from "../../../components/organism/step/product";
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

import { getAllCategory } from "../../../services/category";
import { getAllSubCategory } from "../../../services/sub-category";
import { getAllProduct } from "../../../services/product";

const StepProduct = () => {
  const [cookie] = useCookies(["user"]);

  // QUERY
  const categoryList = useQuery(
    ["get-category"],
    () =>
      getAllCategory({
        location: cookie?.user?.location
      }),
    {
      keepPreviousData: true
    }
  );
  const subCategoryList = useQuery(
    ["get-all-subcategory"],
    () =>
      getAllSubCategory({
        location: cookie?.user?.location
      }),
    {
      keepPreviousData: true
    }
  );

  const productList = useQuery(
    ["get-product"],
    () =>
      getAllProduct({
        category: "",
        nameProduct: "",
        location: cookie?.user?.location
      }),
    {
      keepPreviousData: false
    }
  );

  return (
    <TemplateContainer>
      <div className="flex flex-col justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Product Page</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/dashboard-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      Product Menu
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/product-page">Product</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/category-list">Category</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/sub-category-list">Sub Category</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/product-list">Product</BreadcrumbLink>
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
        <StepFlow
          categoryList={categoryList}
          subCategoryList={subCategoryList}
          productList={productList}
        />
      </div>
    </TemplateContainer>
  );
};

export default StepProduct;
