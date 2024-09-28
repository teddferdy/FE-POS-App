/* eslint-disable react/prop-types */
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { useQuery } from "react-query";

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import DialogAddMember from "./dialogAddMember";
import { Label } from "../../ui/label";
import { cn } from "../../../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../ui/command";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

// Services
import { getAllTypePayment } from "../../../services/type-payment";

// Utils
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { formatCurrencyRupiah } from "../../../utils/formatter-currency";

const DialogCheckout = ({
  order,
  data,
  showDialog,
  handleCheckout,
  hasMember,
  setHasMember,
  handleCloseDialog,
  typeOrder,
  setTypeOrder,
  value,
  setValue,
  submitNewMember,
  memberState,
  handleSearchDialog
}) => {
  // State Show Member Using Switch
  const [open, setOpen] = useState(false);
  const [paymentList, setPaymentList] = useState([
    {
      name: "Cash",
      value: "cash"
    }
  ]);

  const allTypePayment = useQuery(["get-all-type-payment"], () => getAllTypePayment(), {
    retry: 0,
    keepPreviousData: true,
    enabled: showDialog
  });

  useEffect(() => {
    if (allTypePayment?.data?.data) {
      const datas = allTypePayment?.data?.data.map((items) => {
        return {
          name: items.name,
          value: items.name.toLowerCase()
        };
      });
      setPaymentList((prevState) => {
        return [...prevState, ...datas];
      });
    }
  }, [allTypePayment?.data?.data]);

  const totalItems = order.length;

  const FORM_MEMBER = useMemo(() => {
    if (hasMember) {
      return (
        <Fragment>
          <Separator />
          <div className="grid grid-cols-2 items-end gap-2">
            <div className="flex flex-col gap-4">
              <Label className="text-base">User Name</Label>
              <Input type="text" disabled value={memberState.userName} />
            </div>
            <div className="flex flex-col gap-4">
              <Label className="text-base">Phone Number</Label>
              <Input type="text" disabled value={memberState.phoneNumber} />
            </div>
          </div>
          <Button
            className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
            onClick={handleSearchDialog}>
            Cari Member
          </Button>
          <Separator />
        </Fragment>
      );
    }
  }, [hasMember, memberState, handleSearchDialog]);

  return (
    <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Check Out Items</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Tabs */}
          <Tabs
            defaultValue={typeOrder}
            className="flex justify-center"
            onValueChange={(val) => setTypeOrder(val)}>
            <TabsList>
              <TabsTrigger value="Dine-in">Dine-in</TabsTrigger>
              <TabsTrigger value="Take Away">Take Away</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Number Invoice */}
          <div className="flex items-center justify-between">
            <p>Number Invoice</p>
            <p>{data?.invoice}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>Jumlah Items</p>
            <p>{totalItems}</p>
          </div>
          {/* Type Payment */}
          <div className="flex items-center justify-between">
            <p>Tipe Pembayaran</p>
            <Popover open={open} onOpenChange={setOpen} className="mt-10">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-2/4 justify-between">
                  {value
                    ? paymentList.find((items) => items.value === value).name
                    : "Select Type Payment"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search Type Payment" />
                  <CommandList>
                    <CommandEmpty>No Type Payment found.</CommandEmpty>
                    <CommandGroup>
                      {paymentList?.map((items) => (
                        <CommandItem
                          key={items.name}
                          value={items.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue);
                            setOpen(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === items.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {items.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Switch Has Member */}
          <div className="flex items-center justify-between">
            <p>Punya Member ?</p>
            <div className="flex items-center gap-4">
              <p>Tidak</p>
              <Switch checked={hasMember} onCheckedChange={setHasMember} />
              <p>Ya</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p>Detail Items</p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-[#bcbcbc]">Klik Icon Untuk Melihat Items</p>
              <Drawer>
                <DrawerTrigger>
                  <Info className="w-6 h-6" color="#bcbcbc" />
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Daftar Orderan</DrawerTitle>
                    <DrawerDescription>Jumlah Orderan: {totalItems}</DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
                    {order.map((items, index) => {
                      console.log("INI ITEMS =>", items);
                      let extraPrice = 0;
                      const getOptionData = items?.options?.map((v) => {
                        console.log("VVV =>", v);

                        let price = [];
                        v?.option?.length > 0
                          ? v?.option?.map((a) => {
                              return price.push(a.price);
                            })
                          : price.push("0");
                        return price;
                      });

                      let concatOfPrice = getOptionData.reduce(function (flat, toFlatten) {
                        return flat.concat(Array.isArray(toFlatten) ? toFlatten : toFlatten);
                      }, []);

                      concatOfPrice.forEach((element) => {
                        console.log("element", element);

                        extraPrice += Number(element);
                      });

                      const totalingPrice = Number(extraPrice) * items?.count;
                      const linkName = generateLinkImageFromGoogleDrive(items?.img);
                      return (
                        <div
                          className={`grid grid-cols-[50px_50%_auto_auto] border-b border-[#000] pb-4`}
                          key={index}>
                          <p>{index + 1}.</p>
                          <div className="w-full lg:w-5/6 col-start-2 md:col-start-2">
                            <img
                              src={`${linkName}`}
                              alt={items?.orderName}
                              className="object-cover w-full h-full rounded-lg"
                            />
                          </div>
                          <div className="flex flex-col col-start-2 gap-4 md:col-start-3">
                            <p className="text-[#737373] font-semibold text-base">
                              {items?.orderName}
                            </p>
                            <p className="text-[#6853F0] font-semibold text-base">
                              Harga {formatCurrencyRupiah(Number(items?.price))} / pieces
                            </p>
                            <p className="text-[#6853F0] font-semibold text-base">
                              Total Price: {formatCurrencyRupiah(totalingPrice + items?.totalPrice)}
                            </p>
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 col-start-3 md:col-start-4">
                            {items?.options?.map((val, index) => (
                              <div
                                className={`flex flex-col gap-4 ${val?.option.length > 0 ? "" : "hidden"}`}
                                key={index}>
                                <h1>{val?.nameSubCategory}</h1>
                                <div className="flex flex-col gap-4 flex-wrap">
                                  {val?.option?.map((opt, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-wrap items-center gap-4 h-fit">
                                      <p>{opt.name}</p>
                                      <p>
                                        {opt.price !== "0"
                                          ? formatCurrencyRupiah(opt.price)
                                          : "Free"}
                                      </p>
                                    </div>
                                  ))}
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
            </div>
          </div>
        </div>

        {/* Form Member */}
        {FORM_MEMBER}

        <DialogFooter className="flex md:flex-row flex-col gap-4">
          {!hasMember && <DialogAddMember submitNewMember={submitNewMember} />}
          <Button onClick={handleCheckout}>Checkout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCheckout;
