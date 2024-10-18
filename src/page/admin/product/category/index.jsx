import React, { useMemo } from "react";

import { ClipboardPlus, ChevronDown } from "lucide-react";

import { deleteCategory } from "../../../../services/category";
import { Button } from "../../../../components/ui/button";
import { useCookies } from "react-cookie";
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

import { toast } from "sonner";
import { useLoading } from "../../../../components/organism/loading";
import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import TableCategoryList from "../../../../components/organism/table/table-category-list";
import { useMutation, useQuery } from "react-query";
import { getAllCategoryTable } from "../../../../services/category";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";

const CategoryList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);

  // QUERY
  const allCategory = useQuery(
    ["get-all-category-table"],
    () => getAllCategoryTable({ location: cookie?.user?.store }),
    {
      retry: 1,
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    }
  );

  const mutateDeleteCategory = useMutation(deleteCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Category"
        });
      }, 1000);
      setTimeout(() => {
        allCategory.refetch();
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
    if (allCategory.isLoading && allCategory.isFetching && !allCategory.isError) {
      return <SkeletonTable />;
    }

    if (allCategory.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allCategory.refetch()} />
        </div>
      );
    }

    if (allCategory.data && allCategory.isSuccess && !allCategory.isError) {
      return (
        <div className="w-full p-4">
          <TableCategoryList
            allCategory={allCategory}
            handleDelete={(body) => mutateDeleteCategory.mutate(body)}
          />
        </div>
      );
    }
  }, [allCategory, mutateDeleteCategory]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Category</h1>
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
                <BreadcrumbPage>Category List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-category")}>
          <div className="flex items-center gap-4">
            <ClipboardPlus className="w-6 h-6" />
            <p>Add Category</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default CategoryList;
