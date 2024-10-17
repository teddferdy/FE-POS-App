import React, { useMemo } from "react";
import { useCookies } from "react-cookie";
import { Utensils } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import { getAllProductTable } from "../../../services/product";
import ProductCard from "../../../components/organism/card/card-product";

const ListProductByLocation = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies(["user"]);

  // QUERY
  const productList = useQuery(
    ["get-all-product-location-table"],
    () => getAllProductTable({ location: cookie?.user?.store }),
    {
      retry: 0
    }
  );

  const TABLE_SHOW = useMemo(() => {
    if (productList?.isLoading && productList?.isFetching && !productList?.isError) {
      return <SkeletonTable />;
    }

    if (productList?.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => productList?.refetch()} />
        </div>
      );
    }

    if (productList?.data && productList?.isSuccess && !productList?.isError) {
      return productList?.data?.data?.length > 0 ? (
        <div className="grid grid-cols-2  md:grid-cols-4 overflow-scroll flex-wrap gap-4 no-scrollbar pb-20">
          {productList?.data?.data?.map((items, index) => {
            return (
              <div
                className={`${productList?.data?.data?.length === index + 1 ? "mb-72 lg:mb-36" : ""}`}
                key={index}>
                <ProductCard items={items} withActionButton={false} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[65vh] flex justify-center flex-col items-center bg-gray-500 w-full rounded-lg gap-6 mt-4">
          <h1>Product Still Empty</h1>
        </div>
      );
    }
  }, [productList]);

  return (
    <TemplateContainer>
      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#6853F0] text-lg font-bold">
              Product List In {cookie?.user?.location}
            </h1>
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
                    <BreadcrumbLink href="/product-by-outlet">Product By Outlet</BreadcrumbLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Product List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button
            className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
            onClick={() => navigate("/step-flow-product")}>
            <div className="flex items-center gap-4">
              <Utensils className="w-6 h-6" />
              <p>Add Product</p>
            </div>
          </Button>
        </div>

        {/* List Member */}
        <div className="bg-gray-200 p-4 mt-4">{TABLE_SHOW}</div>
      </div>
    </TemplateContainer>
  );
};

export default ListProductByLocation;
