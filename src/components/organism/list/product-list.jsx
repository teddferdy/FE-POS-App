/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import SkeletonProduct from "../skeleton/skeleton-product";
import ProductCard from "../card/card-product";

const arr = Array(40).fill(null);

const ProductList = ({ productList }) => {
  // USE MEMO SECTION
  const LIST_PRODUCT = useMemo(() => {
    if (productList.isLoading && productList.isFetching) {
      return (
        <div className="grid grid-cols-2  md:grid-cols-3 overflow-scroll flex-wrap gap-4 h-screen no-scrollbar">
          {arr.map((_, index) => (
            <SkeletonProduct key={index} />
          ))}
        </div>
      );
    }

    if (productList.data && productList.isSuccess) {
      return productList?.data?.data?.length > 0 ? (
        <div className="grid grid-cols-2  md:grid-cols-3 overflow-scroll flex-wrap gap-4 h-screen no-scrollbar pb-20">
          {productList?.data?.data?.map((items, index) => (
            <div
              className={`${productList?.data?.data?.length === index + 1 ? "mb-72 lg:mb-0" : ""}`}
              key={index}>
              <ProductCard items={items} />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[65vh] flex justify-center items-center bg-white w-full rounded-lg">
          <h1>Product Empty</h1>
        </div>
      );
    }
  }, [productList]);

  return <div className="pb-20 mt-6">{LIST_PRODUCT}</div>;
};

export default ProductList;
