import React, { useState, useMemo } from "react";
import { Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
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
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import TableTypePaymentList from "../../../components/organism/table/table-type-payment-list";
import { getAllTypePayment, deleteTypePayment } from "../../../services/type-payment";
import { useCookies } from "react-cookie";
const TypePaymentList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    statusPayment: "all"
  });

  // QUERY
  const allTypePayment = useQuery(
    ["get-all-type-checkout-payment"],
    () =>
      getAllTypePayment({
        store: cookie?.user?.store,
        limit: pagination.limit,
        page: pagination.page,
        statusPayment: true
      }),
    {
      keepPreviousData: false,
      cacheTime: 0
    }
  );

  const mutateDeleteTypePayment = useMutation(deleteTypePayment, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Type Payment"
        });
      }, 1000);
      setTimeout(() => {
        allTypePayment.refetch();
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
    if (allTypePayment.isLoading && allTypePayment.isFetching && !allTypePayment.isError) {
      return <SkeletonTable />;
    }

    if (allTypePayment.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allTypePayment.refetch()} />
        </div>
      );
    }

    if (allTypePayment.data && allTypePayment.isSuccess && !allTypePayment.isError) {
      return (
        <div className="w-full p-4">
          <TableTypePaymentList
            allTypePayment={allTypePayment}
            handleDelete={(body) => mutateDeleteTypePayment.mutate(body)}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      );
    }
  }, [allTypePayment, mutateDeleteTypePayment, pagination, setPagination]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Type Payment</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/dashboard-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Type Payment List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-type-payment")}>
          <div className="flex items-center gap-4">
            <Wallet className="w-6 h-6" />
            <p>Add Type Payment</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default TypePaymentList;
