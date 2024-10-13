/* eslint-disable react/prop-types */
import React from "react";
import { useCookies } from "react-cookie";
import { ShoppingCart } from "lucide-react";

// Component
// import DialogCustomInvoice from "../dialog/dialogCustomInvoice";
import { Button } from "../../ui/button";
// import DialogCheckout from "../dialog/dialogCheckout";

// Utils
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const CardTotalWeb = ({ order, handleCheckout }) => {
  const [cookie] = useCookies(["user"]);
  const totalItems = order.length;
  let extraPrice = 0;
  let price = 0;
  const totalPrice = order.map((items) => Number(items?.totalPrice));
  totalPrice.forEach((element) => {
    price += element;
  });

  const getOptionData = order.map((v) => {
    let price = [];
    v.options.map((a) => {
      return a.option.map((b) => {
        return price.push(b.price);
      });
    });
    return price;
  });

  let concatOfPrice = getOptionData.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? toFlatten : toFlatten);
  }, []);

  concatOfPrice.forEach((elemet) => {
    extraPrice += Number(elemet);
  });

  return (
    <div
      className={`w-[28%]  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 px-8 fixed bottom-0 z-10 bg-white`}>
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Items :</p>
        <p className="text-[#737373] text-lg font-semibold">{totalItems} Items</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
        <p className="text-[#737373] text-lg font-semibold">
          {formatCurrencyRupiah(price + extraPrice)}
        </p>
      </div>
      <div className="flex justify-between items-center">
        {/* Dialog Custom Invoice */}
        {/* <DialogCustomInvoice /> */}

        {/* Dialog Checkout  */}
        <Button
          disabled={order.length < 1}
          variant="default"
          size="lg"
          className="flex items-center w-full text-base font-bold space-x-2 bg-[#6853F0] text-white hover:bg-green-600 cursor-pointer"
          onClick={() =>
            handleCheckout({
              totalPrice: price + extraPrice,
              cashierName: cookie?.user?.userName,
              customerName: "",
              customerPhoneNumber: "",
              totalQuantity: totalItems,
              typePayment: "",
              createdBy: cookie?.user?.userName,
              store: cookie?.user?.location
            })
          }>
          {/* Icon */}
          <ShoppingCart className="text-lg" />

          {/* Button Text */}
          <span>Checkout</span>
        </Button>
      </div>
    </div>
  );
};

export default CardTotalWeb;
