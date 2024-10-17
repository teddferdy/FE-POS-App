/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
// import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogFooter } from "../../../components/ui/dialog";
import { Asterisk } from "lucide-react";
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
import TemplateContainer from "../../../components/organism/template-container";
import { useCookies } from "react-cookie";

const FormLocation = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { state } = useLocation();
  console.log("state =>", state);

  const linkImage = state?.data?.image?.replace("https://drive.google.com/uc?id=", "");
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${linkImage}&sz=w1000`;
  const [imagePreview, setImagePreview] = useState(state?.data?.image ? thumbnailUrl : null);

  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();

  const formSchema = z.object({
    image:
      state?.data?.image && state?.data.id && state?.data.imageName
        ? z.string().min(4, {
            message: "Image Required."
          })
        : z.instanceof(File).refine((file) => file && file.size > 0, "Image is required"),
    nameStore: z.string().min(4, {
      message: "Name Store must be at least 4 characters & Max Long Character 30."
    }),
    address: z.string().min(4, {
      message: "Address must be at least 4 characters & Max Long Character 255."
    }),
    detailLocation: z.string().min(4, {
      message: "Detail Location must be at least 4 characters & Max Long Character 255."
    }),
    phoneNumber: z.string().min(4, {
      message: "Phone Number Field Required."
    }),
    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: state?.data?.image ?? "",
      nameStore: state?.data?.nameStore ?? "",
      address: state?.data?.address ?? "",
      detailLocation: state?.data?.detailLocation ?? "",
      phoneNumber: state?.data?.phoneNumber ?? "",
      status: state?.data?.status ?? true
    }
  });

  // Mutations for adding and editing location
  const mutateAddLocation = useMutation(addLocation, {
    retry: 1,
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfully added a new location"
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

  const mutateEditLocation = useMutation(editLocation, {
    retry: 1,
    onMutate: () => setActive(true, null),
    onSuccess: (data) => {
      if (data?.showUserUpdateDialog) {
        setTimeout(() => {
          setActive(null, null);
          setShowDialog(true);
        }, 2000);
      } else {
        setActive(false, "success");
        setTimeout(() => {
          toast.success("Success", {
            description: "Successfully edited location"
          });
        }, 1000);
        setTimeout(() => {
          navigate("/location-list");
          setActive(null, null);
        }, 2000);
      }
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
    const formData = new FormData();

    // Append the image file

    // Append other fields
    formData.append("nameStore", values.nameStore);
    formData.append("address", values.address);
    formData.append("detailLocation", values.detailLocation);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("status", values.status);
    formData.append("createdBy", cookie.user.userName); // Assuming you need this as well

    // Use mutate function to send the formData
    if (state?.data?.id) {
      if (values.image instanceof File) {
        formData.append("image", values.image);
        formData.append("modifiedBy", cookie.user.userName);
      } else {
        formData.append("image", values.image);
      }
      formData.append("id", state.data.id);
      mutateEditLocation.mutate(formData);
    } else {
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }
      console.log("HELLO =>", formData.get("image"));

      mutateAddLocation.mutate(formData);
    }
  };

  // Function to handle user confirmation to update all users
  const handleUserUpdateConfirm = () => {
    const body = {
      id: state?.data?.id,
      image: form.getValues("image"),
      nameStore: form.getValues("nameStore"),
      address: form.getValues("address"),
      detailLocation: form.getValues("detailLocation"),
      phoneNumber: form.getValues("phoneNumber"),
      status: form.getValues("status"),
      createdBy: state?.data?.createdBy,
      modifiedBy: cookie.user.userName,
      confirmUserUpdate: true // Add this flag to indicate user confirmation
    };

    mutateEditLocation.mutate(body); // Use the constructed body here
    setShowDialog(false);
  };

  const handleResetImage = () => {
    setImagePreview(null);
    form.setValue("image", null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
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
                  <BreadcrumbLink href="/dashboard-super-admin">Dashboard</BreadcrumbLink>
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 space-y-8 p-4">
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Image Store</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file:cursor-pointer file:px-4 file:rounded-lg file:border-none file:bg-blue-700 file:text-white hover:file:bg-blue-600 file:h-full p-0 h-10"
                      placeholder="imageName"
                    />

                    {form.formState.errors.image && (
                      <FormMessage>{form.formState.errors.image.message}</FormMessage>
                    )}

                    {imagePreview && (
                      <div className="mt-4 relative flex justify-center items-center w-full lg:w-1/2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-auto border-2 border-gray-300 rounded-md object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white rounded-full p-1">
                          X
                        </button>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="nameStore"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Name Store</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Input type="text" {...field} placeholder="Enter Name Store" maxLength={30} />
                    {form.formState.errors.nameStore && (
                      <FormMessage>{form.formState.errors.nameStore}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 lg:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Address</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Textarea
                      type="text"
                      {...field}
                      placeholder="Enter Address Store"
                      maxLength={255}
                    />
                    {form.formState.errors.address && (
                      <FormMessage>{form.formState.errors.address}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 lg:col-span-1">
              <FormField
                control={form.control}
                name="detailLocation"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Detail Location</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Textarea
                      type="text"
                      {...field}
                      placeholder="Example: go to west 700m from Near Gas Station Manahan, left distro store"
                      maxLength={255}
                    />
                    {form.formState.errors.detailLocation && (
                      <FormMessage>{form.formState.errors.detailLocation}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 lg:col-span-1">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Phone Number</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Input
                      type="text"
                      {...field}
                      placeholder="Example: 081388921...."
                      maxLength={15}
                      onInput={handleInput}
                    />
                    {form.formState.errors.phoneNumber && (
                      <FormMessage>{form.formState.errors.phoneNumber}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 lg:col-span-1">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Status</FormLabel>
                    </div>
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
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3">
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
                  {state?.data?.id ? "Edit" : "Save"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={showDialog}>
        <DialogContent>
          <p>Users are associated with this location. Do you want to update all users?</p>
          <DialogFooter>
            <button onClick={() => setShowDialog(false)}>Cancel</button>
            <button onClick={handleUserUpdateConfirm}>Yes, Update Users</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TemplateContainer>
  );
};

export default FormLocation;
