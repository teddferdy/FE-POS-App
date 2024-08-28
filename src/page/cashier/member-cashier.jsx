import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserRoundPlus } from "lucide-react";

// Component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";

import { Form, FormField, FormItem, FormLabel } from "../../components/ui/form";
import TemplateContainer from "../../components/organism/template-container";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const arr = new Array(20).fill(null);

const MemberCashier = () => {
  const [openMenu, setOpenMenu] = useState(false);

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
  const onSubmit = (values) => {
    console.log("VALUES =>", values);
  };

  return (
    <TemplateContainer setOpenMenu={(val) => setOpenMenu(val)} openMenu={openMenu}>
      <div className="border-t-2 border-[#ffffff10] overflow-scroll p-4 flex flex-col h-screen">
        <div className="flex justify-end mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                <div className="flex items-center gap-4">
                  <UserRoundPlus className="w-6 h-6" />
                  <p>Add Member</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Form Member */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-1 items-end gap-4">
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
                      Button
                      className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200 mt-4">
                      Tambah Member
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List Member */}
        <div className="w-full h-[78%] overflow-scroll no-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-fit flex-wrap gap-4">
            {arr.map((_, index) => {
              return (
                <Card
                  key={index}
                  className="cursor-pointer bg-white hover:bg-[#1ACB0A] text-black hover:text-white duration-200">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex items-center justify-between">
                      <p>Nama : </p>
                      <p>Budi</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>No. : </p>
                      <p>086276213123432</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>Total Point : </p>
                      <p>Rp. 12.000</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </TemplateContainer>
  );
};

export default MemberCashier;
