/* eslint-disable react/prop-types */
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../../ui/dialog"; // Adjust based on Shadcn documentation
import SkeletonTable from "../skeleton/skeleton-table";
import AbortController from "../abort-controller";
import LocationCard from "../card/location-card";

const DialogLocationList = ({ allLocation, handleLocation }) => {
  const [open, setOpen] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
          {allLocation?.data?.data?.map((location) => (
            <LocationCard
              key={location.id}
              image={location.image}
              nameStore={location.nameStore}
              address={location.address}
              phoneNumber={location.phoneNumber}
              handleLocation={() => handleLocation(location)}
            />
          ))}
        </div>
      );
    }
  }, [allLocation]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-6 mb-6 text-center shadow-md rounded-lg bg-white w-full cursor-pointer hover:bg-[#1ACB0A] hover:text-white">
          <div className="mb-4 text-4xl">🧑🏻</div>
          <h2 className="text-2xl font-bold mb-2">Select Location</h2>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px] w-full h-96 overflow-scroll">
        <DialogHeader>
          <DialogTitle>Option In Category</DialogTitle>
          <DialogDescription>Apakah Anda yakin akan menghapus item ini?</DialogDescription>
        </DialogHeader>
        {TABLE_SHOW}
      </DialogContent>
    </Dialog>
  );
};

export default DialogLocationList;
