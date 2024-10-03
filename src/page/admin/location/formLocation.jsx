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
import { Textarea } from "../../../components/ui/textarea";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { addLocation, editLocation } from "../../../services/location";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import Hint from "../../../components/organism/label/hint";
import TemplateContainer from "../../../components/organism/template-container";
import { useCookies } from "react-cookie";

const FormLocation = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    nameStore: z.string().min(4, {
      message: "Name Store must be at least 4 characters."
    }),
    address: z.string().min(4, {
      message: "Address must be at least 4 characters."
    }),
    detailLocation: z.string().min(4, {
      message: "Detail Location must be at least 4 characters."
    }),
    phoneNumber: z.string().min(4, {
      message: "Phone Number must be at least 4 characters."
    }),
    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameStore: state?.data?.nameStore ?? "",
      address: state?.data?.address ?? "",
      detailLocation: state?.data?.detailLocation ?? "",
      phoneNumber: state?.data?.phoneNumber ?? "",
      status: state?.data?.status ?? true
    }
  });

  // QUERY
  const mutateAddLocation = useMutation(addLocation, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Location"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/location-list");
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

  const mutateEditLocation = useMutation(editLocation, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Location"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/location-list");
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
        nameStore: values?.nameStore,
        address: values?.address,
        detailLocation: values?.detailLocation,
        phoneNumber: values?.phoneNumber,
        status: true,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditLocation.mutate(body);
    } else {
      const body = {
        nameStore: values?.nameStore,
        address: values?.address,
        detailLocation: values?.detailLocation,
        phoneNumber: values?.phoneNumber,
        status: true,
        createdBy: cookie.user.userName
      };

      mutateAddLocation.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Form Location</h1>
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
                  <BreadcrumbLink href="/location-list">Location List</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Location" : "Form Add Location"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4">
            <FormField
              control={form.control}
              name="nameStore"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Name Store</FormLabel>
                  </div>
                  <Input type="text" {...field} placeholder="Enter Name Store" />
                  {form.formState.errors.nameStore ? (
                    <FormMessage>{form.formState.errors.nameStore}</FormMessage>
                  ) : (
                    <Hint>Enter Name Store Minimum 4 Character</Hint>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Address</FormLabel>
                  </div>
                  <Textarea type="text" {...field} placeholder="Enter Address Store" />
                  {form.formState.errors.address ? (
                    <FormMessage>{form.formState.errors.address}</FormMessage>
                  ) : (
                    <Hint>Enter Address Store Minimum 4 Character</Hint>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detailLocation"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Detail Location</FormLabel>
                  </div>
                  <Textarea type="text" {...field} placeholder="Enter Detail Location" />
                  {form.formState.errors.detailLocation ? (
                    <FormMessage>{form.formState.errors.detailLocation}</FormMessage>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Hint>Enter Detail Location Store Minimum 4 Character</Hint>
                      <Hint>
                        Example: go to west 700m from Near Gas Station Manahan, left distro store
                      </Hint>
                    </div>
                  )}
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Phone Number</FormLabel>
                    </div>
                    <Input type="text" {...field} placeholder="Enter Phone Number Store" />
                    {form.formState.errors.phoneNumber ? (
                      <FormMessage>{form.formState.errors.phoneNumber}</FormMessage>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Hint>Enter Phone Number Store Minimum 4 Character</Hint>
                        <Hint>Example: 081388921....</Hint>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1 -mt-8">
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
                      <Hint>Select yes if percentage want to active</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center">
              <DialogCancelForm
                handleBack={() => navigate("/location-list")}
                classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                titleDialog="Apakah Anda Ingin Membatalkan Ini"
                titleButtonTrigger="Cancel"
              />
              <Button
                className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                type="submit">
                {state?.data?.id ? "Submit Edit Location" : "Save Location"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TemplateContainer>
  );
};

export default FormLocation;
