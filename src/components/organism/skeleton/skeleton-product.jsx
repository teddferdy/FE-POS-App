import React from "react";
import { Skeleton } from "../../ui/skeleton";

const SkeletonProduct = () => {
  return (
    <div className="flex flex-col gap-6 space-x-4 p-4 bg-white rounded-md">
      <Skeleton className="h-24 w-full rounded-md" />
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
};

export default SkeletonProduct;
