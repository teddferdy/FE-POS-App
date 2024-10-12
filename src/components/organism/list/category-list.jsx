/* eslint-disable react/prop-types */
/* eslint-disable no-unsafe-optional-chaining */

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, FreeMode } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import SkeletonCategory from "../skeleton/skeleton-category";

const CategoryList = ({ categoryList, valueFilterCategory, setValueFilterCategory }) => {
  const CATEGORY_DESKTOP = useMemo(() => {
    if (categoryList.isLoading && categoryList.isFetching) {
      const arrLoading = Array(7).fill(null);
      return (
        <div className="gap-4 items-center mb-10 hidden lg:flex">
          {arrLoading.map((_, index) => (
            <SkeletonCategory key={index} />
          ))}
        </div>
      );
    }

    if (categoryList.data && categoryList.isSuccess) {
      const getData = [
        {
          name: "All",
          id: 0
        },
        ...categoryList?.data?.data
      ];

      return (
        <Swiper
          modules={[Pagination, FreeMode]}
          spaceBetween={10}
          slidesPerView={2} // Default for mobile
          freeMode
          // pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 3 // On tablets, show 3 categories
            },
            768: {
              slidesPerView: 4 // On small laptops, show 4 categories
            },
            1024: {
              slidesPerView: 5 // On larger screens, show 5 categories
            }
          }}>
          {getData.map((category, index) => {
            return (
              <SwiperSlide key={index}>
                <div
                  className={`rounded-full flex items-center justify-center ${category.id === valueFilterCategory ? "bg-[#6853F0] text-white" : "text-[#CECECE] bg-white"} font-bold text-base cursor-pointer hover:bg-[#1ACB0A] duration-200 hover:text-white px-10 py-4`}
                  onClick={() => setValueFilterCategory(category.id)}>
                  {category.name}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      );
    }
  }, [categoryList]);

  return <div className="mb-10 lg:mb-0">{CATEGORY_DESKTOP}</div>;
};

export default CategoryList;
