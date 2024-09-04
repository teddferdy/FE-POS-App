/* eslint-disable react/prop-types */
import React from "react";
import { Skeleton } from "../../ui/skeleton";

const SkeletonCategory = ({ widthFull = false }) => {
  return <Skeleton className={`h-14 ${widthFull ? "w-full" : "w-32"} rounded-full`} />;
};

export default SkeletonCategory;
