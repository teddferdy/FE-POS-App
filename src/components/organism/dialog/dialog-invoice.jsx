/* eslint-disable react/prop-types */
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Separator } from "../../ui/separator";

import LogoSidebar from "../../../assets/logo-sidebar.png";

// Components
import { Card, CardHeader, CardFooter, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter } from "../../ui/dialog";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const DialogInvoice = ({ open, onClose, order }) => {
  const [invoiceNumber] = React.useState(`INV-1234214213123123`);
  const cashier = "John Doe";
  const extraPrice = [];
  const totalOrder = order.map((items) => items.count);
  const totalPrice = order.map((items) => items.totalPrice);
  order.forEach((element) => {
    element.options.forEach((items) => {
      items?.option?.forEach((val) => {
        extraPrice.push(Number(val.price));
      });
    });
  });

  const totalOrderItems = totalOrder.reduce((partialSum, a) => partialSum + a, 0);
  const totalPriceByItems = totalPrice.reduce((partialSum, a) => partialSum + a, 0);
  const totalPriceByExtraOptions = extraPrice.reduce((partialSum, a) => partialSum + a, 0);

  const countTotalPrice = totalPriceByItems + totalPriceByExtraOptions;

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Invoice",
    onAfterPrint: () => alert("Print success!")
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-full h-full overflow-scroll">
        <Card ref={componentRef}>
          {/* Header Section: Logo, Invoice Number, Date */}
          <CardHeader className="text-center">
            <img src={LogoSidebar} alt="Company Logo" className="mx-auto h-16" />
            <h1 className="text-xl font-semibold mt-2">Store Name</h1>
            <p className="mt-1 text-xs">123 Main Street, City, Country</p>
            <Separator />
            <div className="flex justify-between mt-2">
              <span className="text-xs">Invoice No: {invoiceNumber}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Cashier Name : {cashier}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Order : dine-in</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Payment : Non-tunai / qris</span>
            </div>
            <Separator />
          </CardHeader>

          <CardContent>
            <h1 className="text-center">Order List</h1>
            {order.map((items) => {
              return (
                <div key={items.id}>
                  <Separator />

                  <p className="text-xs mt-4">{items.orderName}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs">
                      {formatCurrencyRupiah(items.price)} x {items.count}
                    </p>
                    <p className="text-xs">{formatCurrencyRupiah(items.totalPrice)}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 col-start-3 md:col-start-4 mb-4">
                    {items?.options?.map((val, index) => (
                      <div
                        className={`flex flex-col pl-4 ${val?.option.length > 0 ? "" : "hidden"}`}
                        key={index}>
                        <h1 className="text-xs">Tambahan Order</h1>
                        <div className="flex flex-col flex-wrap">
                          {val?.option?.map((opt, index) => (
                            <div
                              key={index}
                              className="flex flex-wrap items-center justify-between gap-4 h-fit">
                              <p className="text-xs">{opt.name}</p>
                              <p className="text-xs">
                                {opt.price !== "0"
                                  ? formatCurrencyRupiah(opt.price)
                                  : "Free / Rp. 0"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              );
            })}

            <div className="flex justify-between items-center mt-4">
              <p className="text-xs">Total Order</p>
              <p className="text-xs">{totalOrderItems} Items</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs">Total Price</p>
              <p className="text-xs">{formatCurrencyRupiah(countTotalPrice)}</p>
            </div>

            <Separator />

            {/* Social Media */}
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs"> INI Website Pribadi</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs">INI IG</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs">INI Twitter</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs">INI Tiktok</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs">INI Facebook</p>
              </div>
            </div>

            {/* <Button className="mt-4" variant="primary" onClick={addItem}>
              Add Item
            </Button> */}
          </CardContent>

          <CardFooter className="justify-center flex-col">
            <p>Jangan Lupa Ulasan & Reviewnya kak</p>
          </CardFooter>
        </Card>
        <DialogFooter>
          <Button onClick={handlePrint}>Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogInvoice;
