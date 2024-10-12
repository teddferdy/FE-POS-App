/* eslint-disable no-undef */
import React, { useMemo } from "react";
import { ClipboardType, ChevronDown } from "lucide-react";
import { useCookies } from "react-cookie";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

import { getAllSubCategory } from "../../../../services/sub-category";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";

import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import { deleteSubCategory } from "../../../../services/sub-category";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";
import TableSubCategoryList from "../../../../components/organism/table/table-subcategory-list";

const SubCategoryList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);

  // QUERY
  const allSubCategory = useQuery(
    ["get-all-sub-caytegory"],
    () => getAllSubCategory({ store: cookie?.user?.location }),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const mutateDeleteSubCategory = useMutation(deleteSubCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Sub Category"
        });
      }, 1000);
      setTimeout(() => {
        allSubCategory.refetch();
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const TABLE_SHOW = useMemo(() => {
    if (allSubCategory.isLoading && allSubCategory.isFetching && !allSubCategory.isError) {
      return <SkeletonTable />;
    }

    if (allSubCategory.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allSubCategory.refetch()} />
        </div>
      );
    }

    if (allSubCategory.data && allSubCategory.isSuccess && !allSubCategory.isError) {
      return (
        <div className="w-full p-4">
          <TableSubCategoryList
            allSubCategory={allSubCategory}
            handleDelete={(body) => mutateDeleteSubCategory.mutate(body)}
          />
        </div>
      );
    }
  }, [allSubCategory, mutateDeleteSubCategory]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Sub Category</h1>
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
                <BreadcrumbPage>Sub Category List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-sub-category")}>
          <div className="flex items-center gap-4">
            <ClipboardType className="w-6 h-6" />
            <p>Add Sub Category</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default SubCategoryList;
