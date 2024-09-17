/* eslint-disable react/prop-types */
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCookies } from "react-cookie";

// Components
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Form, FormField, FormItem, FormLabel } from "../../ui/form";

const DialogAddMember = ({ classNameButtonTrigger, submitNewMember }) => {
  const [cookie] = useCookies(["user"]);

  const formSchema = z.object({
    userName: z.string(),
    phoneNumber: z.string(),
    location: z.string()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      phoneNumber: "",
      location: cookie?.user?.location ?? ""
    }
  });

  const onSubmit = (values) => {
    const body = {
      nameMember: values?.userName,
      phoneNumber: values?.phoneNumber,
      location: values?.location,
      createdBy: cookie.user.userName,
      status: true,
      point: 0
    };
    submitNewMember(body);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={classNameButtonTrigger}>Add New Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Form Member Baru</DialogTitle>
          <DialogDescription>Apakah Anda Ingin Membuat Member Baru?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 items-center gap-2">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">User Name</FormLabel>
                      </div>
                      <div className="relative">
                        <Input type="text" {...field} />
                        <div className="absolute top-[24%] right-[4%]"> </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Phone Number</FormLabel>
                      </div>
                      <div className="relative">
                        <Input type="text" {...field} />
                        <div className="absolute top-[24%] right-[4%]"> </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Lokasi</FormLabel>
                      </div>
                      <div className="relative">
                        <Input type="text" {...field} disabled />
                        <div className="absolute top-[24%] right-[4%]"> </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                  onClick={() => {}}>
                  Bikin Baru
                </Button>
              </div>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogAddMember;
