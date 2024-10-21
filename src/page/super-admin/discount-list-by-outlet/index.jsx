import React, { useState, useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllDiscountByLocationAndActive } from "../../../services/discount";
import TemplateContainer from "../../../components/organism/template-container";
import { useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import TableDiscountList from "../../../components/organism/table/table-discount-list";
import { useCookies } from "react-cookie";

const DiscountListByOutlet = () => {
  const [cookie] = useCookies(["user"]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });

  // QUERY
  const allDiscount = useQuery(
    ["get-all-discount", pagination],
    () =>
      getAllDiscountByLocationAndActive({
        location: cookie?.user?.store,
        limit: pagination.limit,
        page: pagination.page,
        statusDiscount: true
      }),
    {
      retry: 0,
      keepPreviousData: false
    }
  );

  const TABLE_SHOW = useMemo(() => {
    if (allDiscount.isLoading && allDiscount.isFetching && !allDiscount.isError) {
      return <SkeletonTable />;
    }

    if (allDiscount.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allDiscount.refetch()} />
        </div>
      );
    }

    if (allDiscount.data && allDiscount.isSuccess && !allDiscount.isError) {
      return (
        <div className="w-full p-4">
          <TableDiscountList
            allDiscount={allDiscount}
            withActionButton={false}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      );
    }
  }, [allDiscount, pagination, setPagination]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Discount</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/dashboard-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Discount List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default DiscountListByOutlet;
