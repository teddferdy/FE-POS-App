import React, { useMemo } from "react";

import { MapPinPlus } from "lucide-react";
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
import { getAllLocationTable, deleteLocation } from "../../../services/location";
import TemplateContainer from "../../../components/organism/template-container";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../../components/organism/loading";
import { useMutation, useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import TableLocationList from "../../../components/organism/table/table-location-list";

const LocationList = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();

  // QUERY
  const allLocation = useQuery(["get-all-location-table"], () => getAllLocationTable(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateDeleteLocation = useMutation(deleteLocation, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Delete Location"
        });
      }, 1000);
      setTimeout(() => {
        allLocation.refetch();
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
    if (allLocation.isLoading && allLocation.isFetching) {
      return <SkeletonTable />;
    }

    if (allLocation.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allLocation.refetch()} />
        </div>
      );
    }

    if (allLocation.data && allLocation.isSuccess) {
      return (
        <div className="w-full p-4">
          <TableLocationList
            allLocation={allLocation}
            handleDelete={(body) => mutateDeleteLocation.mutate(body)}
          />
        </div>
      );
    }
  }, [allLocation]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Location</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Location List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
          onClick={() => navigate("/add-location")}>
          <div className="flex items-center gap-4">
            <MapPinPlus className="w-6 h-6" />
            <p>Add Location</p>
          </div>
        </Button>
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default LocationList;
