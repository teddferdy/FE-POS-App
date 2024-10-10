/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useQuery } from "react-query";

// Components
import { Button } from "../../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { Instagram, Facebook, Twitter, Globe } from "lucide-react";
import TiktokLogo from "../../../assets/tik-tok.png";
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";

import SkeletonTable from "../skeleton/skeleton-table";
import AbortController from "../abort-controller";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

import {
  getInvoiceLogoByLocation,
  getInvoiceSocialMediaByLocation,
  getInvoiceFooterByLocation
} from "../../../services/invoice";

const DialogViewInvoiceByLocation = ({ nameStore }) => {
  const [open, setOpen] = useState(false);

  //   Query
  const invoiceLogoByLocation = useQuery(
    ["get-invoice-logo-by-location"],
    () => getInvoiceLogoByLocation({ store: nameStore }),
    {
      retry: 0
    }
  );
  const invoiceSocialMediaByLocation = useQuery(
    ["get-invoice-social-media-by-location"],
    () => getInvoiceSocialMediaByLocation({ store: nameStore }),
    {
      retry: 0
    }
  );
  const invoiceFooterByLocation = useQuery(
    ["get-invoice-footer-by-location"],
    () => getInvoiceFooterByLocation({ store: nameStore }),
    {
      retry: 0
    }
  );

  const SHOW_INVOICE_TEMPLATE_BY_LOCATION = useMemo(() => {
    if (
      invoiceLogoByLocation.isLoading &&
      invoiceLogoByLocation.isFetching &&
      invoiceSocialMediaByLocation.isLoading &&
      invoiceSocialMediaByLocation.isFetching &&
      invoiceFooterByLocation.isLoading &&
      invoiceFooterByLocation.isFetching
    ) {
      return <SkeletonTable />;
    }

    if (
      invoiceLogoByLocation.isError &&
      invoiceSocialMediaByLocation.isError &&
      invoiceFooterByLocation.isError
    ) {
      return (
        <div className="p-4">
          <AbortController refetch={() => invoiceLogoByLocation.refetch()} />
        </div>
      );
    }

    if (
      invoiceLogoByLocation.data &&
      invoiceLogoByLocation.isSuccess &&
      invoiceSocialMediaByLocation.data &&
      invoiceSocialMediaByLocation.isSuccess &&
      invoiceFooterByLocation.data &&
      invoiceFooterByLocation.isSuccess
    ) {
      const invoiceLogo = invoiceLogoByLocation.data.data;
      const invoiceSocialMedia = invoiceSocialMediaByLocation.data.data;
      const invoiceFooter = invoiceFooterByLocation.data.data;

      return (
        <Card>
          {/* Header Section: Logo, Invoice Number, Date */}
          {invoiceLogo.length > 0 && (
            <img
              src={generateLinkImageFromGoogleDrive(invoiceLogo)}
              className={`mx-auto h-16 ${invoiceLogo ? "" : "hidden"}`}
            />
          )}
          <CardHeader className="text-center">
            <h1 className="text-xl font-semibold mt-2">This Is Name Store</h1>
            <p className="mt-1 text-xs">This is Address</p>
            <Separator />
            <div className="flex justify-between mt-2">
              <span className="text-xs">Invoice No: xxxxxxxxxxxxxx</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Cashier Name : xxxxxxxxxxx</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Date: xxxxxxxx</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Order : xxxxxxx</span>
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Order : xxxxxxxx</span>
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-xs">Type Payment : xxxxxxxx</span>
            </div>
            <Separator />
          </CardHeader>

          <CardContent>
            <h1 className="text-center">Order List</h1>
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs">Total Order</p>
              <p className="text-xs"> .... Items</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs">Total Price</p>
              <p className="text-xs">Rp. ......</p>
            </div>

            <Separator />

            {/* Social Media */}

            <div className="flex-col gap-4">
              {invoiceSocialMedia.map((items, index) => {
                if (items.socialMedia === "instagram" || items.socialMedia === "Instagram") {
                  return (
                    <div className="flex items-center gap-4 mt-4" key={index}>
                      <Instagram height={20} />
                      <p className="text-xs">{items.name}</p>
                    </div>
                  );
                }
                if (items.socialMedia === "facebook" || items.socialMedia === "Facebook") {
                  return (
                    <div className="flex items-center gap-4 mt-4" key={index}>
                      <Facebook height={20} />
                      <p className="text-xs">{items.name}</p>
                    </div>
                  );
                }
                if (items.socialMedia === "twitter" || items.socialMedia === "Twitter") {
                  return (
                    <div className="flex items-center gap-4 mt-4" key={index}>
                      <Twitter height={20} />
                      <p className="text-xs">{items.name}</p>
                    </div>
                  );
                }
                if (items.socialMedia === "tiktok" || items.socialMedia === "Tiktok") {
                  return (
                    <div className="flex items-center gap-4 mt-4" key={index}>
                      <img src={TiktokLogo} className="w-6 h-6 object-cover" alt="Tiktok Logo" />
                      <p className="text-xs">{items.name}</p>
                    </div>
                  );
                }
                if (
                  items.socialMedia ||
                  items.socialMedia === "website" ||
                  items.socialMedia === "Website"
                ) {
                  return (
                    <div className="flex items-center gap-4 mt-4" key={index}>
                      <Globe height={20} />
                      <p className="text-xs">{items.name}</p>
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>

          {/* View Invoice Footer */}

          <CardFooter className="justify-center flex-col">
            {invoiceFooter?.length > 0 ? (
              invoiceFooter?.map((items, index) => {
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
      );
    }
  }, [invoiceLogoByLocation, invoiceSocialMediaByLocation, invoiceFooterByLocation]);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger>
        <button
          className="flex gap-2 p-2 w-fit rounded overflow-hidden bg-white text-gray-700 hover:bg-[#1ACB0A] duration-200 cursor-pointer hover:text-white"
          onClick={() => setOpen(true)}>
          <Eye className="w-6 h-6 mr-2 text-gray-500" />
          View Invoice
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full h-fit overflow-scroll">
        {SHOW_INVOICE_TEMPLATE_BY_LOCATION}
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogViewInvoiceByLocation;
