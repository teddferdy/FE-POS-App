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
import { Separator } from "../../ui/separator";

const DialogShowOptionProduct = ({ data }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Show Option In Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Option In Category</DialogTitle>
          <DialogDescription>Apakah Anda yakin akan menghapus item ini?</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-6">
          {data?.map((items, index) => {
            const number = index + 1;
            return (
              <li className="flex flex-col gap-4" key={index}>
                <div className="flex items-center justify-between">
                  <p>
                    {number}. Nama: {items.name}
                  </p>
                  <p>Multiple Choose : {items.isMultiple ? "Yes" : "No"}</p>
                </div>
                <ol className="flex flex-col gap-6 ml-4">
                  {items?.option?.map((items, index) => {
                    return (
                      <>
                        <Separator />
                        <li className="flex justify-between flex-wrap gap-4" key={index}>
                          <p>Nama: {items.name}</p>
                          <p>Price: {items.price}</p>
                          <p>Is isFree: {items.isFree ? "Yes" : "No"}</p>
                        </li>
                        <Separator />
                      </>
                    );
                  })}
                </ol>
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

export default DialogShowOptionProduct;
