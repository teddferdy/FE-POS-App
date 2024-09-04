/* eslint-disable react/prop-types */
import React from "react";

// Component
import DialogCustomInvoice from "../dialog/dialogCustomInvoice";
import DialogCheckout from "../dialog/dialogCheckout";
import DrawerDetailOrderMobile from "../drawer/drawer-detail-order-mobile";

// Utils
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const CardTotalMobile = ({
  order,
  dialogMember,
  setDialogMember,
  submitNewMember,
  memberState
}) => {
  let price = 0;
  const totalPrice = order.map((items) => Number(items?.totalPrice));
  totalPrice.forEach((element) => {
    price += element;
  });
  return (
    <div className="w-full border-t border-[#D9D9D9] flex flex-col gap-4 py-4 fixed px-4 left-0 bottom-0 z-10 bg-white lg:hidden">
      <div className="flex justify-between items-center">
        <p className="text-[#737373] text-lg font-semibold">Total Harga :</p>
        <p className="text-[#737373] text-lg font-semibold">{formatCurrencyRupiah(price)}</p>
      </div>
      <div className="flex justify-between items-center">
        {/* Dialog Custom Invoice */}
        <DialogCustomInvoice />

        <div className="flex items-center gap-10">
          <DialogCheckout
            dialogMember={dialogMember}
            setDialogMember={setDialogMember}
            submitNewMember={submitNewMember}
            memberState={memberState}
          />
          <DrawerDetailOrderMobile order={order} />
        </div>
      </div>
    </div>
  );
};

export default CardTotalMobile;
