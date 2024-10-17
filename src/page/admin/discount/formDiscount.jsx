import React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
// import { useTranslation } from "react-i18next";
import { useLoading } from "../../../components/organism/loading";
import { Button } from "../../../components/ui/button";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { addDiscount, editDiscount } from "../../../services/discount";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";
import { useCookies } from "react-cookie";
import Hint from "../../../components/organism/label/hint";

const FormDiscount = () => {
  const { state } = useLocation();
  const [cookie] = useCookies(["user"]);
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    description: z.string().min(4, {
      message: "Description Field Required"
    }),
    percentage: z.string().min(1, {
      message: "Precentage Filed Required"
    }),
    isActive: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: state?.data?.description ?? "",
      percentage: state?.data?.percentage.replace("%", "") ?? "",
      isActive: state?.data?.isActive ?? true
    }
  });

  const handleInput = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (Number(value) > 100) {
      value = "100"; // Cap the value at 100
    }
    e.target.value = value;
  };

  // QUERY
  const mutateAddDiscount = useMutation(addDiscount, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Discount"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/discount-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Discount", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditDiscount = useMutation(editDiscount, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Discount"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/discount-list");
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
        description: values?.description,
        percentage: values?.percentage,
        store: cookie?.user?.store,
        isActive: values?.isActive,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditDiscount.mutate(body);
    } else {
      const body = {
        description: values?.description,
        percentage: values?.percentage,
        isActive: values?.isActive,
        store: cookie?.user?.store,
        createdBy: cookie.user.userName
      };

      mutateAddDiscount.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Form Discount</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/dashboard-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/discount-list">Discount List</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Form Discount</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Description</FormLabel>
                  </div>
                  <Input type="text" {...field} placeholder="Enter Description" maxLength={255} />
                  {form.formState.errors.description ? (
                    <FormMessage>{form.formState.errors.description}</FormMessage>
                  ) : (
                    <Hint>Enter Description Percentage Minimum Character 4</Hint>
                  )}
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Percentage</FormLabel>
                    </div>
                    <Input
                      type="text"
                      {...field}
                      placeholder="Enter Percentage Number"
                      maxLength={3}
                      onInput={handleInput}
                    />
                    {form.formState.errors.percentage ? (
                      <FormMessage>{form.formState.errors.percentage}</FormMessage>
                    ) : (
                      <Hint>Enter Percentage Max 3 Number and max number 100</Hint>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Is Active</FormLabel>
                    </div>
                    <div className="flex-col">
                      <div className="flex items-center gap-6 mb-4">
                        <p>Not Active</p>
                        <Switch
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <p>Active</p>
                      </div>
                      <Hint>Select yes if percentage want to active</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center">
              <DialogCancelForm
                handleBack={() => navigate("/discount-list")}
                classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                titleDialog="Apakah Anda Ingin Membatalkan Ini"
                titleButtonTrigger="Cancel"
              />
              <Button
                className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                type="submit">
                {state?.data?.id ? "Edit" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TemplateContainer>
  );
};

export default FormDiscount;
