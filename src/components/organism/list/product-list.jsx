/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import SkeletonProduct from "../skeleton/skeleton-product";
import ProductCard from "../card/card-product";

const arr = Array(40).fill(null);

const ProductList = ({ productList }) => {
  // USE MEMO SECTION
  const LIST_PRODUCT = useMemo(() => {
    if (productList.isLoading && productList.isFetching) {
      return arr.map((_, index) => <SkeletonProduct key={index} />);
    }

    if (productList.data && productList.isSuccess) {
      return productList?.data?.data?.map((items, index) => (
        <div
          className={`${productList.data.data.length === index + 1 ? "mb-24 lg:mb-0" : ""}`}
          key={index}>
          <ProductCard items={items} />
        </div>
      ));
    }
  }, [productList]);

  return (
    <div className="grid grid-cols-2  md:grid-cols-3 overflow-scroll flex-wrap gap-4 h-screen no-scrollbar pb-20">
      {LIST_PRODUCT}
    </div>
  );
};

export default ProductList;
