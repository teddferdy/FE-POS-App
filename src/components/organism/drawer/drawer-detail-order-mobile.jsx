/* eslint-disable react/prop-types */
import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "../../ui/button";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Checkbox } from "../../ui/checkbox";
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";

const DrawerDetailOrderMobile = ({
  order,
  setOpenModalDelete,
  handleUpdateOptionProduct,
  decrementOrder,
  incrementOrder
}) => {
  return (
    <Drawer>
      <DrawerTrigger className="w-full">
        <Button
          variant="outline"
          size="lg"
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 w-full py-3">
          <ShoppingCart className="text-xl" />
          <span>Order List</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Daftar Orderan</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
          {order?.map((items, index) => {
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
                                <p>
                                  {opt.price !== "0" ? formatCurrencyRupiah(opt.price) : "Free"}
                                </p>
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
                                <div
                                  key={index}
                                  className="flex flex-wrap items-center gap-4 h-fit">
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
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerDetailOrderMobile;
