import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Info } from "lucide-react";

// Components
import { Card, CardContent } from "../../ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Form, FormField, FormItem, FormLabel } from "../../ui/form";
import { Switch } from "../../ui/switch";

const arr = Array(40).fill(null);
const DialogCheckout = () => {
  // State Show Member Using Switch
  const [hasMember, setHasMember] = useState(false);
  const [dialogMember, setDialogMember] = useState(false);
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
    // return mutateLogin.mutate(values);
  };

  const FORM_MEMBER = useMemo(() => {
    if (hasMember) {
      return (
        <>
          <Separator />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 items-end gap-2">
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
            </form>
          </Form>
          <Button
            className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
            onClick={() => setDialogMember(!dialogMember)}>
            Cari Member
          </Button>
          <Separator />
        </>
      );
    }
  }, [hasMember]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="px-3 py-2 bg-[#6853F0] text-base font-bold text-white rounded-full">
            Check Out
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle> Check Out Items </DialogTitle>
            <DialogDescription> Mohon di check lagi!! </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Switch Has Member */}
            <div className="flex items-center justify-between">
              <p>Punya Member ?</p>
              <Switch checked={hasMember} onCheckedChange={() => setHasMember(!hasMember)} />
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
                                <p className="text-[#737373] font-semibold text-base">
                                  Nasi Goreng
                                </p>
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
            <Button type="submit">Checkout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Member */}
      <Dialog open={dialogMember} onOpenChange={() => setDialogMember(!dialogMember)}>
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
                      <FormLabel className="text-base"> User Name </FormLabel>
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
                      <FormLabel className="text-base"> Phone Number </FormLabel>
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
          </section>
          <Separator />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogCheckout;
