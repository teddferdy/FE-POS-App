import React from "react";
import { Skeleton } from "../../ui/skeleton";

const SkeletonTable = () => {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center w-full gap-4">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[250px]" />
      </div>
      <Skeleton className="w-full h-80 rounded-lg" />
      <div className="flex flex-col gap-4 md:flex-row justify-between md:items-center w-full">
        <Skeleton className="h-10 w-full md:w-[250px]" />
        <Skeleton className="h-10 w-full md:w-[250px]" />
      </div>
    </div>
  );
};

export default SkeletonTable;
