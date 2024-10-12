import React, { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import TemplateContainer from "../../../components/organism/template-container";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import { getAllTypePaymentListActive } from "../../../services/type-payment";
import TableTypePaymentList from "../../../components/organism/table/table-type-payment-list";

const TypePaymentListByLocation = () => {
  const { state } = useLocation();
  console.log("STATE =>", state);

  // QUERY
  const typePayment = useQuery(
    ["get-all-type-payment-location-table"],
    () => getAllTypePaymentListActive({ store: state.location }),
    {
      retry: 0
    }
  );

  const TABLE_SHOW = useMemo(() => {
    if (typePayment?.isLoading && typePayment?.isFetching && !typePayment?.isError) {
      return <SkeletonTable />;
    }

    if (typePayment?.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => typePayment?.refetch()} />
        </div>
      );
    }

    if (typePayment?.data && typePayment?.isSuccess && !typePayment?.isError) {
      console.log("typePayment?.data?.data?.length =>", typePayment?.data?.data?.length);

      return (
        <div className="w-full p-4">
          <TableTypePaymentList allTypePayment={typePayment} withActionButton={false} />
        </div>
      );
    }
  }, [typePayment]);

  return (
    <TemplateContainer>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Product List In {state.location}</h1>
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

        {/* List Member */}
        {TABLE_SHOW}
      </div>
    </TemplateContainer>
  );
};

export default TypePaymentListByLocation;
