/* eslint-disable react/prop-types */
import React from "react";

// Components
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
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
        <button className="flex items-center gap-1 hover:bg-gray-100 w-full">
          <Badge isActive={checked} />
          {checked ? "Active" : "No Active"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apakah Anda Ingin {checked ? "Non Aktifkan" : "Aktifkan"}</DialogTitle>
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
