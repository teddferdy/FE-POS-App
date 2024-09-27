/* eslint-disable react/prop-types */
import React from "react";

// Components
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "../../ui/dialog";

const DialogSocialMediaInvoice = ({ data }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Show Social Media List</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Option In Category</DialogTitle>
          <DialogDescription>Apakah Anda yakin akan menghapus item ini?</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-6">
          {data?.map((items, index) => {
            console.log("ITEMS =>", items);
            return (
              <li className="flex flex-col gap-4" key={index}>
                <p>Social Media: {items?.socialMedia}</p>
                <p>Nama Social Media: {items?.name}</p>
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSocialMediaInvoice;
