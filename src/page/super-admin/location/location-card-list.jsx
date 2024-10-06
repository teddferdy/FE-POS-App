import React, { useMemo } from "react";

// import { MapPinPlus } from "lucide-react";
// import { Button } from "../../../components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { getAllLocation } from "../../../services/location";
import TemplateContainer from "../../../components/organism/template-container";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import SkeletonTable from "../../../components/organism/skeleton/skeleton-table";
import AbortController from "../../../components/organism/abort-controller";
import LocationCard from "../../../components/organism/card/location-card";

const LocationCardList = () => {
  //   const navigate = useNavigate();

  // QUERY
  const allLocation = useQuery(["get-all-location-card"], () => getAllLocation(), {
    retry: 0,
    keepPreviousData: true
  });

  const TABLE_SHOW = useMemo(() => {
    if (allLocation.isLoading && allLocation.isFetching && !allLocation.isError) {
      return <SkeletonTable />;
    }

    if (allLocation.isError) {
      return (
        <div className="p-4">
          <AbortController refetch={() => allLocation.refetch()} />
        </div>
      );
    }

    if (allLocation.data && allLocation.isSuccess && !allLocation.isError) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-4">
          {allLocation?.data?.data?.map((location) => (
            <LocationCard
              key={location.id}
              image={location.image}
              nameStore={location.nameStore}
              address={location.address}
              phoneNumber={location.phoneNumber}
            />
          ))}
        </div>
      );
    }
  }, [allLocation]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Location List</h1>
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
      </div>

      {/* List Member */}
      {TABLE_SHOW}
    </TemplateContainer>
  );
};

export default LocationCardList;
