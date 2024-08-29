/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLoading } from "../../../components/organism/loading";
import { Button } from "../../../components/ui/button";
import { ClipboardPlus } from "lucide-react";
import DialogButton from "../../../components/organism/dialog/DialogButton";

import { Input } from "../../../components/ui/input";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";

const FormCategory = () => {
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    userName: z.string().min(4, {
      message: "Username must be at least 4 characters."
    }),
    password: z.string().min(4, {
      message: "Password must be at least 4 characters."
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: ""
    }
  });

  // QUERY
  //   const mutateLogin = useMutation(login, {
  //     onMutate: () => setActive(true, null),
  //     onSuccess: (success) => {
  //       setActive(false, "success");
  //       setTimeout(() => {
  //         toast.success("Success", {
  //           description: "Welcome, Login User successfully"
  //         });
  //       }, 1000);
  //       setTimeout(() => {
  //         navigate("/location-list");
  //         setActive(null, null);
  //       }, 2000);
  //     },
  //     onError: (err) => {
  //       setActive(false, "error");
  //       setTimeout(() => {
  //         toast.error("Failed Login", {
  //           description: err.message
  //         });
  //       }, 1500);
  //       setTimeout(() => {
  //         setActive(null, null);
  //       }, 2000);
  //     }
  //   });

  const onSubmit = (values) => {
    // mutateLogin.mutate(values)
  };

  return (
    <TemplateContainer>
      <main className="border-t-2 border-[#ffffff10] overflow-scroll flex flex-col gap-8 h-full">
        <div className="flex items-center gap-4">
          <ClipboardPlus className="w-6 h-6" />
          <p>Add Category</p>
        </div>

        <div className="w-full lg:w-3/4 mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">HELLO</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                    {form.formState.errors.userName && (
                      <FormMessage>{form.formState.errors.userName}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">SUPP</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                    {form.formState.errors.password && (
                      <FormMessage>{form.formState.errors.password}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <DialogButton
                  classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                  titleDialog="Apakah Anda Ingin Membatalkan Ini"
                  titleButtonTrigger="Cancel"
                />
                <DialogButton
                  buttonAction={() => alert("HELLO")}
                  classNameButtonTrigger="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                  titleDialog="Apakah Anda Ingin Membuat Category Ini"
                  titleButtonTrigger="Submit"
                  type="submit"
                />
              </div>
            </form>
          </Form>
        </div>
      </main>
    </TemplateContainer>
  );
};

export default FormCategory;
