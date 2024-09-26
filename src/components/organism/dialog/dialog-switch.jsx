/* eslint-disable react/prop-types */
import React from "react";

// Components
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "../../ui/dialog";

const DialogBySwitch = ({ checked, onChange }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-6">
          <p>Not Active</p>
          <Switch name="isActive" id="isActive" checked={checked} />
          <p>Active</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apakah Anda Ingin Membatalkan Ini</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={onChange}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBySwitch;
