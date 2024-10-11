import React, { useMemo } from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
// import { useTranslation } from "react-i18next";

import { Separator } from "../../../../components/ui/separator";
import { useLoading } from "../../../../components/organism/loading";
import { Button } from "../../../../components/ui/button";
import { ChevronDown, PlusIcon, TrashIcon } from "lucide-react";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addInvoiceFooter, editInvoiceFooter } from "../../../../services/invoice";
import Hint from "../../../../components/organism/label/hint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";

import { useCookies } from "react-cookie";

const userInfoSchema = z.object({
  content: z.string()
});

const FormInvoiceFooter = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(4, {
      message: "Name be at least 4 characters."
    }),
    status: z.boolean(),
    footerList: z.array(userInfoSchema)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      status: state?.data?.status ?? true,
      footerList: state?.data?.footerList || [{ content: "" }]
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "footerList",
    control: form.control
  });

  const mutateAddInvoiceFooter = useMutation(addInvoiceFooter, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Footer Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/footer-invoice-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Footer Invoice", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditInvoiceSocialMedia = useMutation(editInvoiceFooter, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Social Media Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/footer-invoice-list");
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
        name: values.name,
        footerList: values?.footerList?.length > 0 ? JSON.stringify(values?.footerList) : "",
        status: values?.status,
        store: cookie?.user?.location,
        isActive: false,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditInvoiceSocialMedia.mutate(body);
    } else {
      const body = {
        name: values.name,
        isActive: false,
        footerList: values?.footerList?.length > 0 ? JSON.stringify(values?.footerList) : "",
        store: cookie?.user?.location,
        status: values.status,
        createdBy: cookie.user.userName
      };

      mutateAddInvoiceFooter.mutate(body);
    }
  };

  const ADDING_OPTION = useMemo(() => {
    return (
      <div className="col-span-2">
        {fields?.map((items, index) => {
          const numb = index + 1;
          return (
            <div key={index}>
              <Separator />
              <div key={index} className="flex py-6 items-center gap-6 justify-between relative">
                <div className="flex-1 flex-col">
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Content Footer {numb}</FormLabel>
                    </div>

                    <FormField
                      control={form.control}
                      name={`footerList.${index}.content`} // Bind dropdown to field value
                      render={({ field }) => (
                        <Input
                          type="text"
                          {...field}
                          defaultValue={items.content}
                          placeholder="Enter Content Footer"
                        />
                      )}
                    />
                    <Hint>Enter Content Footer Invoice Minimum 4 Character</Hint>
                  </FormItem>
                </div>
                {/* Delete on Resolution Table - Desktop */}
                <div
                  className="mt-3 hidden md:flex"
                  onClick={() => {
                    if (fields?.length === 1) {
                      form.setValue("option", false);
                      form.setValue("footerList", []);
                    } else {
                      remove(index);
                    }
                  }}>
                  <Button
                    variant="ghost"
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                    <TrashIcon className="h-4 w-4" />
                    <p>Delete</p>
                  </Button>
                </div>

                {/* Delete on Mobile */}
                <div
                  className="absolute right-1 top-1 md:hidden"
                  onClick={() => {
                    if (fields?.length === 1) {
                      form.setValue("option", false);
                      form.setValue("footerList", []);
                    } else {
                      remove(index);
                    }
                  }}>
                  <Button
                    variant="ghost" // No background initially (ghost)
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center transition-colors duration-200">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
          );
        })}
      </div>
    );
  }, [form, fields, remove, update]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Footer Form</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/admin-page">Dashboard</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      Invoice Menu
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/logo-invoice-list">Logo</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/footer-invoice-list">Footer</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/social-media-invoice-list">
                          Social Media
                        </BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink>
                <BreadcrumbLink href="/footer-invoice-list">Footer List</BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Footer" : "Form Add Footer"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Name Template Footer Invoice</FormLabel>
                      </div>
                      <Input
                        type="text"
                        {...field}
                        className="flex-1"
                        placeholder="Enter Name Template Footer"
                      />
                      {form.formState.errors.name ? (
                        <FormMessage>{form.formState.errors.name}</FormMessage>
                      ) : (
                        <Hint>Enter Name Template Footer Invoice Minimum 4 Character</Hint>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Status</FormLabel>
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
                      <Hint>Select yes if Template Footer want to active</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Adding Option */}
            {ADDING_OPTION}
            {/* End Form Adding Option */}

            {/* Button Adding Option */}
            <div className="col-span-2 flex justify-center cursor-pointer">
              <div
                className="col-span-2 flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                onClick={() =>
                  append({
                    content: ""
                  })
                }>
                <PlusIcon className="h-5 w-5" />
                <span>Add Option</span>
              </div>
            </div>

            <div className="col-span-2 flex justify-between items-center">
              <DialogCancelForm
                handleBack={() => navigate("/footer-invoice-list")}
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

export default FormInvoiceFooter;
