import React, { useState } from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useLoading } from "../../../../components/organism/loading";
import { Button } from "../../../../components/ui/button";
import { ChevronDown, Asterisk } from "lucide-react";
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
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addInvoiceLogo, editInvoiceLogo } from "../../../../services/invoice";
import Hint from "../../../../components/organism/label/hint";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";
import { useCookies } from "react-cookie";

const FormInvoiceLogo = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const linkImage = state?.data?.image?.replace("https://drive.google.com/uc?id=", "");
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${linkImage}&sz=w1000`;
  const [imagePreview, setImagePreview] = useState(state?.data?.image ? thumbnailUrl : null);

  const formSchema = z.object({
    image: z.union([
      z.instanceof(File).refine((file) => file.size > 0, "Image is required"),
      z.string().min(1, "Image URL is required").optional()
    ]),
    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: state?.data?.image ?? "",
      status: state?.data?.status ?? true
    }
  });

  // QUERY
  const mutateAddInvoiceLogo = useMutation(addInvoiceLogo, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Logo Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/logo-invoice-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Logo Invoice", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditInvoiceLogo = useMutation(editInvoiceLogo, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Logo Invoice"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/logo-invoice-list");
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
    const formData = new FormData();
    // Append other fields
    formData.append("status", values.status);
    formData.append("isActive", false);
    formData.append("store", cookie?.user?.store);
    formData.append("createdBy", cookie.user.userName); // Assuming you need this as well

    // Use mutate function to send the formData
    if (state?.data?.id) {
      if (values.image instanceof File) {
        formData.append("image", values.image);
        formData.append("modifiedBy", cookie.user.userName);
      } else {
        formData.append("image", state.data.image);
      }
      formData.append("id", state.data.id);
      mutateEditInvoiceLogo.mutate(formData);
    } else {
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      mutateAddInvoiceLogo.mutate(formData);
    }
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

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Footer Invoice</h1>
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
                <BreadcrumbLink href="/logo-invoice-list">Invoice Logo List</BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Logo" : "Form Add Logo"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto  p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="image"
                render={() => (
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
                      <div className="mt-4 relative flex justify-center items-center w-full">
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
                      <Hint>Select yes if Image Logo want to active</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/logo-invoice-list")}
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
    </TemplateContainer>
  );
};

export default FormInvoiceLogo;
