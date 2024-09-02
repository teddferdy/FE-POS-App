/* eslint-disable react/prop-types */
import React from "react";
import { useQuery } from "react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Form, FormField, FormItem, FormLabel } from "../../ui/form";

// Services
import { getAllMember } from "../../../services/member";

const DialogMember = ({ dialogMember, setDialogMember, selectMember }) => {
  const formSchema = z.object({
    userName: z.string(),
    phoneNumber: z.string()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      phoneNumber: ""
    }
  });

  // Query
  const allMember = useQuery(
    ["get-all-member"],
    () =>
      getAllMember({
        nameMember: form.getValues("userName"),
        phoneNumber: form.getValues("phoneNumber")
      }),
    {
      retry: 0,
      keepPreviousData: false,
      enabled: dialogMember
    }
  );

  const onSubmit = () => allMember.refetch();

  return (
    <Dialog open={dialogMember} onOpenChange={setDialogMember}>
      <DialogContent className="max-w-screen lg:max-w-[80%] max-h-screen overflow-scroll">
        <DialogHeader>
          <DialogTitle> Cari Member </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 lg:grid-cols-3 items-end gap-4">
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
            <Button
              type="submit"
              className="py-2 px-4 w-36 bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
              Cari
            </Button>
          </form>
        </Form>
        <Separator />
        <section className="grid items-center grid-cols-2 gap-4">
          {allMember?.data?.data?.map((items, index) => {
            return (
              <Card
                key={index}
                className="cursor-pointer bg-white hover:bg-[#1ACB0A] text-black hover:text-white duration-200"
                onClick={() => selectMember(items)}>
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex items-center justify-between">
                    <p>Nama : </p>
                    <p>{items?.nameMember}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>No. : </p>
                    <p>{items?.phoneNumber}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Total Point : </p>
                    <p>{items?.point}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
        <Separator />
      </DialogContent>
    </Dialog>
  );
};

export default DialogMember;
