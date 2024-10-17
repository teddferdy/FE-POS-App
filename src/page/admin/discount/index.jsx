import React, { useMemo } from "react";
import { Percent } from "lucide-react";
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
import { getAllDiscount, deleteDiscount } from "../../../services/discount";
import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import TableDiscountList from "../../../components/organism/table/table-discount-list";
import { useCookies } from "react-cookie";

const DiscountList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const [cookie] = useCookies(["user"]);

  // QUERY
  const allDiscount = useQuery(
    ["get-all-discount"],
    () => getAllDiscount({ location: cookie?.user?.store }),
    {
      retry: 0,
      keepPreviousData: true
    }
  );

  const mutateDeleteDiscount = useMutation(deleteDiscount, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Discount"
        });
      }, 1000);
      setTimeout(() => {
        allDiscount.refetch();
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
            handleDelete={(body) => mutateDeleteDiscount.mutate(body)}
          />
        </div>
      );
    }
  }, [allDiscount, mutateDeleteDiscount]);

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
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-discount")}>
          <div className="flex items-center gap-4">
            <Percent className="w-6 h-6" />
            <p>Add Discount</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default DiscountList;
