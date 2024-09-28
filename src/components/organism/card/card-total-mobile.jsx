/* eslint-disable react/prop-types */
import React from "react";
import { useCookies } from "react-cookie";

// Component
// import DialogCustomInvoice from "../dialog/dialogCustomInvoice";
import { Button } from "../../ui/button";
import DrawerDetailOrderMobile from "../drawer/drawer-detail-order-mobile";

// Utils
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const CardTotalMobile = ({
  order,
  option,
  handleUpdateOptionProduct,
  decrementOrder,
  incrementOrder,
  handleCheckout,
  setOpenModalDelete
}) => {
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
    <div className="w-full border-t border-[#D9D9D9] flex flex-col gap-4 py-4 fixed px-4 left-0 bottom-0 z-10 bg-white lg:hidden">
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
        <p className="text-[#737373] text-lg font-semibold">
          {formatCurrencyRupiah(price + extraPrice)}
        </p>
      </div>
      <div className="flex justify-between items-center">
        {/* Dialog Custom Invoice */}
        {/* <DialogCustomInvoice /> */}

        <div className="flex items-center gap-10">
          <Button
            className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full"
            onClick={() =>
              handleCheckout({
                totalPrice: price + extraPrice,
                cashierName: cookie.user.userName,
                customerName: "",
                customerPhoneNumber: "",
                totalQuantity: totalItems,
                typePayment: "",
                createdBy: cookie.user.userName
              })
            }>
            Check Out
          </Button>
          <DrawerDetailOrderMobile
            order={order}
            option={option}
            setOpenModalDelete={setOpenModalDelete}
            handleUpdateOptionProduct={handleUpdateOptionProduct}
            decrementOrder={decrementOrder}
            incrementOrder={incrementOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default CardTotalMobile;
