/* eslint-disable no-unused-vars */
import React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLoading } from "../../../components/organism/loading";
import { Button } from "../../../components/ui/button";
import { MapPinPlus } from "lucide-react";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";
import { useCookies } from "react-cookie";
import { addTypePayment, editTypePayment } from "../../../services/type-payment";

const FormTypePayment = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name Store must be at least 1 characters."
    }),
    description: z.string().min(4, {
      message: "Description must be at least 4 characters."
    }),

    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      description: state?.data?.description ?? "",
      status: state?.data?.status ?? true
    }
  });

  // QUERY
  const mutateAddTypePayment = useMutation(addTypePayment, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Type Payment"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/type-payment-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Login", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditTypePayment = useMutation(editTypePayment, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Type Payment"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/type-payment-list");
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
        description: values?.description,
        status: values.status,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditTypePayment.mutate(body);
    } else {
      const body = {
        name: values?.name,
        description: values?.description,
        status: values.status,
        createdBy: cookie.user.userName
      };

      mutateAddTypePayment.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex items-center gap-4 p-4">
        <MapPinPlus className="w-6 h-6" />
        <p>Add Location</p>
      </div>

      <div className="w-full lg:w-3/4 mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">name</FormLabel>
                  </div>
                  <Input type="text" {...field} />
                  {form.formState.errors.name && (
                    <FormMessage>{form.formState.errors.name}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">description</FormLabel>
                    </div>
                    <Textarea {...field} />
                    {form.formState.errors.description && (
                      <FormMessage>{form.formState.errors.description}</FormMessage>
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
                      <FormLabel className="text-base">Is Active</FormLabel>
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
    </TemplateContainer>
  );
};

export default FormTypePayment;
