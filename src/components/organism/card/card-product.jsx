/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

// State
import { orderList } from "../../../state/order-list";

const ProductCard = ({ items }) => {
  const { addingProduct } = orderList();
  const [count, setCount] = useState(0);

  const linkImage = generateLinkImageFromGoogleDrive(items?.image);

  const decrement = () =>
    setCount((prevState) => {
      if (prevState < 1) {
        return (prevState = 0);
      } else {
        return --prevState;
      }
    });

  const increment = () => setCount((prevState) => ++prevState);

  const handleAddingProduct = (items) => {
    const options = JSON.parse(items.option).map((items) => {
      return {
        option: [],
        isMultiple: items.isMultiple,
        nameSubCategory: items.nameSubCategory,
        typeSubCategory: JSON.parse(items.typeSubCategory)
      };
    });

    addingProduct({
      id: Math.random().toString(),
      idProduct: items?.id,
      orderName: items?.nameProduct,
      price: items?.price,
      count: count,
      totalPrice: Number(items?.price) * count,
      img: items?.image,
      options: options
    });
  };

  return (
    <div className="p-2 rounded-lg flex flex-col gap-4 bg-white h-fit">
      {linkImage && (
        <img src={`${linkImage}`} alt="img" className="object-cover w-full h-48 rounded-lg" />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[#737373] font-bold text-base">{items?.nameProduct || "-"}</p>
        <p className="text-[#737373] text-sm w-4/5">{items?.description || "-"}</p>
        <p className="text-[#737373] font-bold text-base">
          {formatCurrencyRupiah(items?.price) || "-"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[#CECECE] text-sm">Masukan Jumlah :</p>
        <div className="flex justify-between items-center">
          <button
            className="flex-1 py-1 rounded-full flex items-center justify-center bg-[#6853F0] text-white"
            onClick={decrement}>
            -
          </button>
          <div className="flex-1 text-black font-bold text-lg text-center">{count}</div>
          <button
            className="flex-1 py-1 rounded-full flex items-center justify-center bg-[#6853F0] text-white"
            onClick={increment}>
            +
          </button>
        </div>
      </div>
      <button
        className="w-full h-6 py-6 text-xs font-bold rounded-md flex items-center justify-center bg-[#6853F0] text-white hover:bg-[#1ACB0A] duration-200 hover:text-white"
        onClick={() => handleAddingProduct(items)}>
        Masukan Keranjang
      </button>
    </div>
  );
};

export default ProductCard;
