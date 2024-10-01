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
import { Percent } from "lucide-react";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addInvoiceFooter, editInvoiceFooter } from "../../../../services/invoice";

import { Form, FormField, FormItem, FormLabel } from "../../../../components/ui/form";
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
              <div key={index} className="flex py-6 items-start gap-6 justify-between">
                <div className="flex-1 flex-col">
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Content Footer {numb}</FormLabel>
                    </div>

                    <FormField
                      control={form.control}
                      name={`footerList.${index}.content`} // Bind dropdown to field value
                      render={({ field }) => (
                        <Input type="text" {...field} defaultValue={items.content} />
                      )}
                    />
                  </FormItem>
                </div>
                <div
                  className="flex justify-end self-center mt-10"
                  onClick={() => {
                    if (fields?.length === 1) {
                      form.setValue("option", false);
                      form.setValue("footerList", []);
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
  }, [form, fields, remove, update]);

  return (
    <TemplateContainer>
      <div className="flex items-center gap-4 p-4">
        <Percent className="w-6 h-6" />
        <p>Add Footer Invoice</p>
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
                        <FormLabel className="text-base">Name Template Footer Invoice</FormLabel>
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
                    content: ""
                  })
                }>
                Add Footer List
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
    </TemplateContainer>
  );
};

export default FormInvoiceFooter;
