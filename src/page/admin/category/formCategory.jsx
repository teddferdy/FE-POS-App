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
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Switch } from "../../../components/ui/switch";
import { useLocation } from "react-router-dom";

import { Input } from "../../../components/ui/input";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";
import { useCookies } from "react-cookie";

import { addCategory, editCategory } from "../../../services/category";

const FormCategory = () => {
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(4, {
      message: "Username must be at least 4 characters.",
      status: z.boolean()
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      status: state?.data?.status ?? true
    }
  });

  // Query
  const mutateAddLocation = useMutation(addCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Category"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/category-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditCategory = useMutation(editCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit New Category"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/category-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const onSubmit = (values) => {
    if (state?.data?.id) {
      const body = {
        id: state?.data?.id,
        name: values?.name,
        value: values?.name?.toLowerCase(),
        status: values?.status,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditCategory.mutate(body);
    } else {
      const body = {
        name: values.name,
        value: values.name.toLowerCase(),
        status: true,
        createdBy: cookie.user.userName
      };

      mutateAddLocation.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <main className="border-t-2 border-[#ffffff10] overflow-scroll flex flex-col h-screen p-4 gap-6">
        <div className="flex items-center gap-4">
          <ClipboardPlus className="w-6 h-6" />
          <p>Add Category</p>
        </div>

        <div className="w-full lg:w-3/4 mx-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 overflow-scroll h-screen">
              <div className="flex justify-between items-center gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="mb-4">
                        <FormLabel className="text-base">Name Category</FormLabel>
                      </div>
                      <Input type="text" {...field} />
                      {form.formState.errors.name && (
                        <FormMessage>{form.formState.errors.name}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="mb-4">
                        <FormLabel className="text-base">Status</FormLabel>
                      </div>
                      <div className="flex items-center gap-6">
                        <p>Not Active</p>
                        <Switch
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <p>Active</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                  titleDialog="Apakah Anda Ingin Membatalkan Ini"
                  titleButtonTrigger="Cancel"
                />
                <Button
                  className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                  type="submit">
                  Yes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </TemplateContainer>
  );
};

export default FormCategory;
