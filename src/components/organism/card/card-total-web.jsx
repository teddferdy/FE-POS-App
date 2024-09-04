/* eslint-disable react/prop-types */
import React from "react";

// Component
import DialogCustomInvoice from "../dialog/dialogCustomInvoice";
import DialogCheckout from "../dialog/dialogCheckout";

// Utils
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const CardTotalWeb = ({
  order,
  openMenu,
  dialogMember,
  setDialogMember,
  submitNewMember,
  memberState
}) => {
  let price = 0;
  const totalItems = order.length;
  const totalPrice = order.map((items) => Number(items?.totalPrice));
  totalPrice.forEach((element) => {
    price += element;
  });

  return (
    <div
      className={`${!openMenu ? "w-[27%]" : "w-[24%]"}  border-t border-[#D9D9D9] flex flex-col gap-4 py-4 px-8 fixed bottom-0 z-10 bg-white`}>
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Items :</p>
        <p className="text-[#737373] text-lg font-semibold">{totalItems} Items</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
        <p className="text-[#737373] text-lg font-semibold">{formatCurrencyRupiah(price)}</p>
      </div>
      <div className="flex justify-between items-center">
        {/* Dialog Custom Invoice */}
        <DialogCustomInvoice />

        {/* Dialog Checkout  */}
        <DialogCheckout
          dialogMember={dialogMember}
          setDialogMember={setDialogMember}
          submitNewMember={submitNewMember}
          memberState={memberState}
        />
      </div>
    </div>
  );
};

export default CardTotalWeb;
