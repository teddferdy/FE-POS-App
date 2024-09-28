/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React, { Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Separator } from "../../ui/separator";
import { useCookies } from "react-cookie";
import { Instagram, Facebook, Twitter, Globe } from "lucide-react";
import TiktokLogo from "../../../assets/tik-tok.png";

// Components
import { Card, CardHeader, CardFooter, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter } from "../../ui/dialog";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

// State
import { invoice } from "../../../state/invoice";
import { checkout } from "../../../state/checkout";
import { orderList } from "../../../state/order-list";

const DialogInvoice = ({
  open,
  data,
  order,
  dataInvoiceLogo,
  dataInvoiceFooter,
  dataInvoiceSocialMedia
}) => {
  console.log("dataInvoiceFooter =>", dataInvoiceFooter);

  const { resetInvoice } = invoice();
  const { cancelCheckout } = checkout();
  const { resetOrder } = orderList();
  const [cookie] = useCookies(["user"]);
  console.log("cookie =>", cookie);

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
    onAfterPrint: () => {
      resetInvoice();
      cancelCheckout();
      resetOrder();
    }
  });

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px] w-full h-full overflow-scroll">
        <Card ref={componentRef}>
          {/* Header Section: Logo, Invoice Number, Date */}
          <CardHeader className="text-center">
            {dataInvoiceLogo && (
              <img
                src={generateLinkImageFromGoogleDrive(dataInvoiceLogo.image)}
                alt="Company Logo"
                className="mx-auto h-16"
              />
            )}

            <h1 className="text-xl font-semibold mt-2">{cookie.user.location}</h1>
            <p className="mt-1 text-xs">{cookie.user.address}</p>
            <Separator />
            <div className="flex justify-between mt-2">
              <span className="text-xs">Invoice No: {data?.noInvoice}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Cashier Name : {data?.cashierName}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Order : {data?.typeOrder}</span>
            </div>
            {data?.isMember ? (
              <Fragment>
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Order By: {data?.memberName}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs">Numb Phone Order : {data?.memberPhoneNumber}</span>
                </div>
              </Fragment>
            ) : (
              <div className="flex justify-between mt-2">
                <span className="text-xs">Type Order : {data?.noInvoice}</span>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Payment : {data?.typePayment}</span>
            </div>
            <Separator />
          </CardHeader>

          <CardContent>
            <h1 className="text-center">Order List</h1>
            {order.map((items, index) => {
              const number = index + 1;
              return (
                <div key={items.id}>
                  <Separator />

                  <p className="text-xs mt-4">
                    {number}. {items.orderName}
                  </p>
                  <div className="flex justify-between items-center ml-3">
                    <p className="text-xs">
                      {formatCurrencyRupiah(items.price)} / pieces x {items.count} items
                    </p>
                    <p className="text-xs">{formatCurrencyRupiah(items.totalPrice)}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 col-start-3 md:col-start-4 mb-4">
                    {items?.options?.map((val, index) => (
                      <div
                        className={`flex flex-col pl-4 ${val?.option.length > 0 ? "" : "hidden"}`}
                        key={index}>
                        <h1 className="text-xs">Tambahan Order</h1>
                        <div className="flex flex-col flex-wrap w-full">
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
            {dataInvoiceSocialMedia?.socialMediaList && (
              <div className="flex-col gap-4">
                {dataInvoiceSocialMedia?.socialMediaList.map((items) => {
                  if (items.socialMedia === "instagram" || items.socialMedia === "Instagram") {
                    return (
                      <div className="flex items-center gap-4 mt-4">
                        <Instagram height={20} />
                        <p className="text-xs">{items.name}</p>
                      </div>
                    );
                  }
                  if (items.socialMedia === "facebook" || items.socialMedia === "Facebook") {
                    return (
                      <div className="flex items-center gap-4 mt-4">
                        <Facebook height={20} />
                        <p className="text-xs">{items.name}</p>
                      </div>
                    );
                  }
                  if (items.socialMedia === "twitter" || items.socialMedia === "Twitter") {
                    return (
                      <div className="flex items-center gap-4 mt-4">
                        <Twitter height={20} />
                        <p className="text-xs">{items.name}</p>
                      </div>
                    );
                  }
                  if (items.socialMedia === "tiktok" || items.socialMedia === "Tiktok") {
                    return (
                      <div className="flex items-center gap-4 mt-4">
                        <img src={TiktokLogo} className="w-6 h-6 object-cover" alt="Tiktok Logo" />
                        <p className="text-xs">{items.name}</p>
                      </div>
                    );
                  }
                  if (items.socialMedia === "website" || items.socialMedia === "Website") {
                    return (
                      <div className="flex items-center gap-4 mt-4">
                        <Globe height={20} />
                        <p className="text-xs">{items.name}</p>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center flex-col">
            {dataInvoiceFooter.footerList ? (
              dataInvoiceFooter.footerList.map((items, index) => {
                return (
                  <p className="text-xs mt-4" key={index}>
                    {items.content}
                  </p>
                );
              })
            ) : (
              <p>Jangan Lupa Ulasan & Reviewnya kak</p>
            )}
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
