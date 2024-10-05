/* eslint-disable react/prop-types */
import React from "react";
import { Trash } from "lucide-react";

// Components
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "../../ui/dialog";

const DialogDeleteItem = ({ actionDelete }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-4 p-2 hover:bg-gray-100 w-full">
          <Trash className="w-6 h-6 mr-2 text-gray-500" />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apakah Anda Ingin Menghapus Item Ini</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={actionDelete}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDeleteItem;
