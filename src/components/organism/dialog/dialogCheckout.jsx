/* eslint-disable react/prop-types */
import React, { Fragment, useMemo } from "react";
import { Info } from "lucide-react";

// Components
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import DialogAddMember from "./dialogAddMember";
import { Label } from "../../ui/label";

const arr = Array(40).fill(null);
const DialogCheckout = ({
  data,
  handleCheckout,
  showDialog,
  hasMember,
  setHasMember,
  handleCloseDialog,

  submitNewMember,
  memberState,
  setDialogMember
}) => {
  // State Show Member Using Switch

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
            onClick={setDialogMember}>
            Cari Member
          </Button>
          <Separator />
        </Fragment>
      );
    }
  }, [hasMember, memberState]);

  return (
    <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check Out Items</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Number Invoice */}
          <div className="flex items-center justify-between">
            <p>Number Invoice</p>
            <p>{data?.invoice}</p>
          </div>
          {/* Type Payment */}
          <div className="flex items-center justify-between">
            <p>Tipe Pembayaran</p>
          </div>

          {/* Switch Has Member */}
          <div className="flex items-center justify-between">
            <p>Punya Member ?</p>
            <div className="flex items-center gap-4">
              <p>Tidak</p>
              <Switch checked={hasMember} onCheckedChange={() => setHasMember(!hasMember)} />
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
                  </DrawerHeader>
                  <div className="overflow-scroll no-scrollbar flex-1 flex flex-col gap-4 px-8">
                    {arr.map((_, index) => {
                      return (
                        <div className={`flex gap-4 border-b border-[#000]  pb-4`} key={index}>
                          <p>{index + 1}.</p>
                          <div className="flex gap-4 flex-1 items-center">
                            <div className="w-30 h-20">
                              <img
                                src="https://asset.kompas.com/crops/MrdYDsxogO0J3wGkWCaGLn2RHVc=/84x60:882x592/750x500/data/photo/2021/11/17/61949959e07d3.jpg"
                                alt="img"
                                className="object-cover w-full h-full rounded-lg"
                              />
                            </div>
                            <div className="flex flex-col gap-4">
                              <p className="text-[#737373] font-semibold text-base">Nasi Goreng</p>
                              <p className="text-[#6853F0] font-semibold text-base">Rp. 24.000</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 justify-center items-center">
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                              -
                            </button>
                            <div className="text-black font-bold text-lg">2</div>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[#6853F0] text-white">
                              +
                            </button>
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

        <DialogFooter>
          {!hasMember && <DialogAddMember submitNewMember={submitNewMember} />}
          <Button onClick={handleCheckout}>Checkout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCheckout;
