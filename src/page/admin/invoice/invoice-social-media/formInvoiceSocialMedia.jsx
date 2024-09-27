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
import { Percent } from "lucide-react";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addInvoiceSocialMedia, editInvoiceSocialMedia } from "../../../../services/invoice";
import { getAllSocialMedia } from "../../../../services/social-media";

import { Form, FormField, FormItem, FormLabel } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "../../../../components/ui/dropdown-menu";

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

      console.log("BODY =>", body);

      mutateAddInvoiceSocialMedia.mutate(body);
    }
  };

  const ADDING_OPTION = useMemo(() => {
    return (
      <div className="col-span-2">
        {fields?.map((items, index) => {
          console.log("ITEMS =>", items);
          const numb = index + 1;
          return (
            <div key={index}>
              <Separator />
              <div key={index} className="flex py-6 items-start gap-6 justify-between">
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
                                  console.log("column", column);
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
                        <Input type="text" {...field} defaultValue={items.name} />
                      )}
                    />
                  </FormItem>
                </div>
                <div
                  className="flex justify-end self-center mt-10"
                  onClick={() => {
                    console.log("fields", fields);
                    console.log("fields.length", fields.length);

                    if (fields?.length === 1) {
                      form.setValue("option", false);
                      form.setValue("socialMediaList", []);
                    } else {
                      remove(index);
                    }
                  }}>
                  <Button>Delete</Button>
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
      <main className="border-t-2 border-[#ffffff10] overflow-scroll flex flex-col h-screen p-4 gap-6">
        <div className="flex items-center gap-4">
          <Percent className="w-6 h-6" />
          <p>Add Social Media Invoice</p>
        </div>

        <div className="w-full lg:w-3/4 mx-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 lg:grid-cols-2 w-3/4 gap-8 my-24 mx-auto lg:w-full">
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
                        <Input type="text" {...field} className="flex-1" />
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

              {/* Form Adding Option */}
              {ADDING_OPTION}
              {/* End Form Adding Option */}

              {/* Button Adding Option */}
              <div className="col-span-2 flex justify-center cursor-pointer">
                <div
                  className="col-span-2"
                  onClick={() =>
                    append({
                      name: "",
                      socialMedia: ""
                    })
                  }>
                  Add Social Media List
                </div>
              </div>

              <div className="col-span-2 flex justify-between items-center">
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

export default FormInvoiceSocialMedia;
