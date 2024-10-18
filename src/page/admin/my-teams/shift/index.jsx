import React, { useMemo } from "react";
import { AlarmClockPlus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
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
import { getAllShift, deleteShift } from "../../../../services/shift";
import TableShiftList from "../../../../components/organism/table/table-shift-list";
import TemplateContainer from "../../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../../components/organism/abort-controller";

const ShiftList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  // QUERY
  const allShift = useQuery(["get-all-shift"], () => getAllShift(), {
    retry: 1,
    cacheTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  const mutateDeleteShift = useMutation(deleteShift, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Shift"
        });
      }, 1000);
      setTimeout(() => {
        allShift.refetch();
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
    if (allShift.isLoading && allShift.isFetching && !allShift.isError) {
      return <SkeletonTable />;
    }

    if (allShift.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allShift.refetch()} />
        </div>
      );
    }

    if (allShift.data && allShift.isSuccess && !allShift.isError) {
      return (
        <div className="w-full p-4">
          <TableShiftList
            allShift={allShift}
            handleDelete={(body) => mutateDeleteShift.mutate(body)}
          />
        </div>
      );
    }
  }, [allShift, mutateDeleteShift]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Shift</h1>
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
                      My Teams
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/shift-list">Shift</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/user-list">User</BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shift List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-shift")}>
          <div className="flex items-center gap-4">
            <AlarmClockPlus className="w-6 h-6" />
            <p>Add Shift</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default ShiftList;
