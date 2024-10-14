/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { ShoppingCart } from "lucide-react";

// Component
import SkeletonOrderList from "../skeleton/skeleton-order-list";
// import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Checkbox } from "../../ui/checkbox";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const arr = Array(40).fill(null);

const OrderList = ({
  productList,
  order,
  // option,
  decrementOrder,
  incrementOrder,
  setOpenModalDelete,
  handleUpdateOptionProduct
}) => {
  const ORDER_LIST = useMemo(() => {
    if (productList.isLoading && productList.isFetching)
      return arr.map((_, index) => <SkeletonOrderList key={index} />);

    if (productList.data && productList.isSuccess) {
      const empty = order.length < 1;

      return empty ? (
        <div className="flex flex-col items-center justify-center h-80 text-center space-y-4 p-6 bg-gray-100 border-2 border-gray-300 rounded-lg">
          {/* Icon */}
          <div className="p-4 bg-white border-2 border-gray-300 rounded-full">
            <ShoppingCart className="text-6xl text-gray-500" />
          </div>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-gray-800">Your order list is empty!</h2>
        </div>
      ) : (
        order?.map((items, index) => {
          const linkName = generateLinkImageFromGoogleDrive(items?.img);
          return (
            <div
              key={index}
              className={`flex flex-col gap-4 border-b border-[#000]  ${index + 1 === order?.length ? "pb-56" : "pb-4"}`}>
              <div className="flex gap-4">
                <p>{index + 1}.</p>
                <div className="flex gap-4 flex-1 items-center">
                  <div className="w-20 h-20">
                    <img
                      src={linkName}
                      alt={items?.orderName}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-[#737373] font-semibold text-base">{items?.orderName}</p>
                    <p className="text-[#6853F0] font-semibold text-base">
                      {formatCurrencyRupiah(items?.totalPrice)}
                    </p>
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

              <div className="flex flex-col gap-4 pl-6">
                {items?.options?.map((val, index) => (
                  <div className="flex flex-col gap-4 justify-between" key={index}>
                    <h1>{val?.nameSubCategory}</h1>
                    <div className="flex items-center gap-6 flex-wrap">
                      {val?.isMultiple && (
                        <>
                          {val?.typeSubCategory?.map((opt, index) => (
                            <div key={index} className="flex flex-wrap items-center gap-4 h-fit">
                              <Checkbox
                                className="h-6 w-6"
                                checked={val.option?.some((val) => val?.name === opt?.name)}
                                // checked={false}
                                onCheckedChange={(checked) =>
                                  handleUpdateOptionProduct(
                                    checked,
                                    {
                                      ...opt,
                                      nameSubCategory: val?.nameSubCategory,
                                      isMultiple: val?.isMultiple
                                    },
                                    items?.id
                                  )
                                }
                              />
                              <p>{opt.name}</p>
                              <p>{opt.price !== "0" ? formatCurrencyRupiah(opt.price) : "Free"}</p>
                            </div>
                          ))}
                        </>
                      )}

                      {!val?.isMultiple && (
                        <>
                          <RadioGroup
                            key={index}
                            onValueChange={(radioVal) =>
                              handleUpdateOptionProduct(
                                radioVal,
                                {
                                  value: radioVal,
                                  option: val?.typeSubCategory.filter(
                                    (items) => items.name === radioVal
                                  ),
                                  nameSubCategory: val?.nameSubCategory,
                                  isMultiple: val?.isMultiple
                                },
                                items?.id
                              )
                            }>
                            {val?.typeSubCategory?.map((opt, index) => (
                              <div key={index} className="flex flex-wrap items-center gap-4 h-fit">
                                <RadioGroupItem
                                  value={opt.name}
                                  id={opt.name}
                                  checked={opt?.name === val?.value}
                                />
                                <p>{opt.name}</p>
                                <p>
                                  {opt.price !== "0" ? formatCurrencyRupiah(opt.price) : "Free"}
                                </p>
                              </div>
                            ))}
                          </RadioGroup>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      );
    }
  }, [productList, order, decrementOrder, incrementOrder, setOpenModalDelete]);

  return (
    <div className="overflow-scroll h-auto no-scrollbar flex-1 flex flex-col gap-4 px-8">
      {ORDER_LIST}
    </div>
  );
};

export default OrderList;
