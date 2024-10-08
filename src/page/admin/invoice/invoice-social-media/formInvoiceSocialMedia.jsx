import React, { useMemo } from "react";
import { useMutation, useQuery } from "react-query";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "../../../../components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addInvoiceSocialMedia, editInvoiceSocialMedia } from "../../../../services/invoice";
import { getAllSocialMedia } from "../../../../services/social-media";
import Hint from "../../../../components/organism/label/hint";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";

import { useCookies } from "react-cookie";

const userInfoSchema = z.object({
  socialMedia: z.string(),
  name: z.string()
});

const FormInvoiceSocialMedia = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(4, {
      message: "Name be at least 4 characters."
    }),
    status: z.boolean(),
    socialMediaList: z.array(userInfoSchema)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      status: state?.data?.status ?? true,
      socialMediaList: state?.data?.socialMediaList || [{ name: "", socialMedia: "" }]
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "socialMediaList",
    control: form.control
  });

  // QUERY
  const allSocialMedia = useQuery(["get-all-social-media"], () => getAllSocialMedia(), {
    retry: 0,
    keepPreviousData: true
  });

  const mutateAddInvoiceSocialMedia = useMutation(addInvoiceSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Social Media Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/social-media-invoice-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Social Media Invoice", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditInvoiceSocialMedia = useMutation(editInvoiceSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Social Media Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/social-media-invoice-list");
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
        socialMediaList:
          values?.socialMediaList?.length > 0 ? JSON.stringify(values?.socialMediaList) : "",
        status: values?.status,
        isActive: false,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditInvoiceSocialMedia.mutate(body);
    } else {
      const body = {
        name: values.name,
        isActive: false,
        socialMediaList:
          values?.socialMediaList?.length > 0 ? JSON.stringify(values?.socialMediaList) : "",
        status: values.status,
        createdBy: cookie.user.userName
      };

      mutateAddInvoiceSocialMedia.mutate(body);
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
              <div key={index} className="flex py-6 items-start gap-6 justify-between relative">
                <div className="flex-1">
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Social Media {numb}</FormLabel>
                    </div>
                    <FormField
                      control={form.control}
                      name={`socialMediaList.${index}.socialMedia`} // Bind dropdown to field value
                      render={({ field: { onChange, value } }) => {
                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="ml-auto">
                                {value || "Select Social Media"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
                                {allSocialMedia?.data?.data?.map((column) => {
                                  return (
                                    <DropdownMenuRadioItem value={column.name} key={column}>
                                      {column.name}
                                    </DropdownMenuRadioItem>
                                  );
                                })}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      }}
                    />
                    <Hint>Select Social Media</Hint>
                  </FormItem>
                </div>
                <div className="flex-1 flex-col">
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Name Social Media {numb}</FormLabel>
                    </div>
                    <FormField
                      control={form.control}
                      name={`socialMediaList.${index}.name`} // Bind dropdown to field value
                      render={({ field }) => (
                        <Input
                          type="text"
                          {...field}
                          defaultValue={items.name}
                          placeholder="Enter Social Media Name"
                        />
                      )}
                    />
                    <Hint>Enter Social Media User Name</Hint>
                    <Hint>Example: @USERNAME_IG / @USERNAME_TIKTOK / dsb</Hint>
                  </FormItem>
                </div>

                <div
                  className="justify-end self-center -mt-4 hidden md:flex"
                  onClick={() => {
                    if (fields?.length === 1) {
                      form.setValue("option", false);
                      form.setValue("socialMediaList", []);
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
                      form.setValue("socialMediaList", []);
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
  }, [allSocialMedia, form, fields, remove, update]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Social Media Invoice</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
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
                <BreadcrumbLink href="/social-media-invoice-list">
                  Invoice Social Media List
                </BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Social Media" : "Form Add Social Media"}
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
                        <FormLabel className="text-base">
                          Name Template Social Media Invoice
                        </FormLabel>
                      </div>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter Name Template Social Media"
                        className="flex-1"
                      />
                      {form.formState.errors.name ? (
                        <FormMessage>{form.formState.errors.name}</FormMessage>
                      ) : (
                        <Hint>Enter Name Template Social Media Minimum 4 Character</Hint>
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
                    <div className="flex flex-col gap-2">
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
                      <Hint>Select yes if you want to activate template option</Hint>
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
                    name: "",
                    socialMedia: ""
                  })
                }>
                <PlusIcon className="h-5 w-5" />
                <span>Add Option</span>
              </div>
            </div>

            <div className="col-span-2 flex justify-between items-center">
              <DialogCancelForm
                handleBack={() => navigate("/social-media-invoice-list")}
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

export default FormInvoiceSocialMedia;
