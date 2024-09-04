/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import SkeletonOrderList from "../skeleton/skeleton-order-list";

const arr = Array(40).fill(null);
const OrderList = ({ productList, order, decrementOrder, incrementOrder, setOpenModalDelete }) => {
  const ORDER_LIST = useMemo(() => {
    if (productList.isLoading && productList.isFetching) {
      return arr.map((_, index) => <SkeletonOrderList key={index} />);
    }

    if (productList.data && productList.isSuccess) {
      return order?.map((items, index) => {
        const linkName = generateLinkImageFromGoogleDrive(items?.img);
        return (
          <div
            className={`flex gap-4 border-b border-[#000]  ${index + 1 === order?.length ? "pb-56" : "pb-4"}`}
            key={index}>
            <p>{index + 1}.</p>
            <div className="flex gap-4 flex-1 items-center">
              <div className="w-30 h-20">
                <img
                  src={`${linkName}`}
                  alt={items?.orderName}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[#737373] font-semibold text-base">{items?.orderName}</p>
                <p className="text-[#6853F0] font-semibold text-base">{items?.totalPrice}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 justify-center items-center">
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white"
                onClick={() =>
                  items?.count <= 1
                    ? setOpenModalDelete({
                        open: true,
                        id: items?.id
                      })
                    : decrementOrder({
                        ...items,
                        img: items?.img
                      })
                }>
                -
              </button>
              <div className="text-black font-bold text-lg">{items?.count}</div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white"
                onClick={() =>
                  incrementOrder({
                    ...items,
                    img: items?.img
                  })
                }>
                +
              </button>
            </div>
          </div>
        );
      });
    }
  }, [productList, order, decrementOrder, incrementOrder, setOpenModalDelete]);

  return (
    <div className="overflow-scroll h-auto no-scrollbar flex-1 flex flex-col gap-4 px-8">
      {ORDER_LIST}
    </div>
  );
};

export default OrderList;
