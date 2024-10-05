/* eslint-disable react/prop-types */
import React from "react";
import { Eye } from "lucide-react";
// Components
import { Button } from "../../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "../../ui/dialog";

import { Separator } from "../../ui/separator";
import { Instagram, Facebook, Twitter, Globe } from "lucide-react";
import TiktokLogo from "../../../assets/tik-tok.png";
// Components
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";

const DialogViewInvoice = ({ footerList, invoiceType, socialMediaList, logoInvoice }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <button className="flex items-center gap-4 p-2 hover:bg-gray-100 w-full">
          <Eye className="w-6 h-6 mr-2 text-gray-500" />
          View
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full h-fit overflow-scroll">
        <Card>
          {/* Header Section: Logo, Invoice Number, Date */}
          {invoiceType === "logo" && (
            <CardHeader className="text-center">
              {logoInvoice && (
                <img
                  src={generateLinkImageFromGoogleDrive(logoInvoice)}
                  className={`mx-auto h-16 ${logoInvoice ? "" : "hidden"}`}
                />
              )}

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
          )}

          {invoiceType === "social-media" || invoiceType === "footer" ? (
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
              {socialMediaList && (
                <div className="flex-col gap-4">
                  {socialMediaList.map((items, index) => {
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
                          <img
                            src={TiktokLogo}
                            className="w-6 h-6 object-cover"
                            alt="Tiktok Logo"
                          />
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
              )}
            </CardContent>
          ) : null}

          {/* View Invoice Footer */}
          {invoiceType === "footer" && (
            <CardFooter className="justify-center flex-col">
              {footerList?.length > 0 ? (
                footerList?.map((items, index) => {
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
          )}

          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DialogViewInvoice;
