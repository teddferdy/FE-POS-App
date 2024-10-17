import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, ChevronDown, Asterisk } from "lucide-react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";

// Component
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
import { Switch } from "../../../../components/ui/switch";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import { useLoading } from "../../../../components/organism/loading";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import TemplateContainer from "../../../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../../../components/ui/command";
import DrawerSelectSubCategory from "../../../../components/organism/drawer/drawer-select-sub-category";

// Services
import { addProduct, editProduct } from "../../../../services/product";
import { getAllCategory } from "../../../../services/category";
import { getSubCategoryByCategory } from "../../../../services/sub-category";

const FormProduct = () => {
  const { state } = useLocation();
  const [cookie] = useCookies(["user"]);

  const linkImage = state?.data?.image?.replace("https://drive.google.com/uc?id=", "");
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${linkImage}&sz=w1000`;
  const [imagePreview, setImagePreview] = useState(state?.data?.image ? thumbnailUrl : null);

  const { setActive } = useLoading();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleInput = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = value;
  };

  const formSchema = z
    .object({
      image:
        state?.data?.image && state?.data.id && state?.data.imageName
          ? z.string().min(4, {
              message: "Image Required."
            })
          : z.instanceof(File).refine((file) => file && file.size > 0, "Image is required"),
      nameProduct: z.string().min(4, {
        message: "Enter Name Product Minimum Character 4 and max character 30."
      }),
      description: z.string().min(4, {
        message: "Enter Description Minimum 4 Character & Max 255 Character."
      }),
      category: z.number().min(1, {
        message: "Category Cannot Empty"
      }),
      price: z.string().min(2, {
        message: "Enter Price Minimum 2 Character Price Product Must Number And Not Alphabet"
      }),
      status: z.boolean(),
      isOption: z.boolean(),
      subCategory: z.array(z.number()).optional() // Make optional initially
    })
    .refine((data) => !data.isOption || data.subCategory?.length > 0, {
      message: "At least one sub-category is required if options are enabled.",
      path: ["subCategory"] // This will apply the error message to the `subCategory` field
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      image: state?.data?.image ?? "",
      nameProduct: state?.data?.nameProduct ?? "",
      category: state?.data?.category ?? null,
      status: state?.data?.status ?? true,
      price: state?.data?.price ?? "",
      description: state?.data?.description ?? "",
      isOption: state?.data?.isOption ?? false,
      subCategory: state?.data?.option?.map((items) => items.id) ?? []
    }
  });

  // QUERY
  const allCategory = useQuery(
    ["get-all-category"],
    () => getAllCategory({ location: cookie?.user?.store }),
    {
      keepPreviousData: false
    }
  );

  const allSubCategory = useQuery(
    ["get-all-sub-category", form.getValues("category")],
    () =>
      getSubCategoryByCategory({
        idParentCategory: form.getValues("category"),
        store: cookie?.user?.store
      }),
    {
      enabled: !!form.getValues("isOption") && !!form.getValues("category"),
      keepPreviousData: false
    }
  );

  const mutateAddProduct = useMutation(addProduct, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Product"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/product-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Product", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditProduct = useMutation(editProduct, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Product"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/product-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Product", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const onSubmit = (values) => {
    console.log("values =>", values);

    const formData = new FormData();
    // Append other fields
    formData.append("nameProduct", values.nameProduct);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("status", values.status);
    formData.append("price", values.price);
    formData.append("isOption", values.isOption);
    formData.append("option", values.option);
    formData.append("store", cookie?.user?.store);
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
      mutateEditProduct.mutate(formData);
    } else {
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }
      console.log("HELLO =>", formData.get("image"));
      mutateAddProduct.mutate(formData);
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
          <h1 className="text-[#6853F0] text-lg font-bold">Form Product</h1>
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
                      Product Menu
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/category-list">Category</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/sub-category-list">Sub Category</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/product-list">Product</BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink>
                <BreadcrumbLink href="/product-list">Category List</BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Product" : "Form Add Product"}
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
            <div className="col-span-3">
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
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="nameProduct"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Name Product</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Input type="text" {...field} placeholder="Enter Name Product" maxLength={30} />
                    {form.formState.errors.nameProduct && (
                      <FormMessage>{form.formState.errors.nameProduct}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 lg:col-span-1">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Description</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Textarea {...field} placeholder="Enter Description Product" maxLength={255} />
                    {form.formState.errors.description && (
                      <FormMessage>{form.formState.errors.description}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 lg:col-span-1">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Price Product</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Input
                      type="text"
                      {...field}
                      placeholder="Enter Price Product"
                      onInput={handleInput}
                    />
                    {form.formState.errors.price && (
                      <FormMessage>{form.formState.errors.price}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 lg:col-span-1">
              <FormField
                control={form.control}
                name="isOption"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Adding Option</FormLabel>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <p>No</p>
                      <Switch
                        name={field.name}
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={(val) => {
                          if (!val) {
                            form.setValue("subCategory", []);
                          }
                          field.onChange(val);
                        }}
                      />
                      <p>Yes</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3 lg:col-span-1">
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
            <div className="col-span-3 lg:col-span-1">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="mb-4 flex items-center gap-2">
                        <FormLabel className="text-base">Category</FormLabel>
                        <Asterisk className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              disabled={allCategory.isLoading}
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between">
                              {field.value
                                ? allCategory?.data?.data?.find(
                                    (location) => location.id === field.value
                                  )?.name
                                : "Select Category"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search Category" />
                              <CommandList>
                                <CommandEmpty>No Category found.</CommandEmpty>
                                <CommandGroup>
                                  {allCategory?.data?.data?.map((location) => {
                                    return (
                                      <CommandItem
                                        key={location.name}
                                        value={location.id}
                                        onSelect={() => {
                                          field.onChange(location.id);
                                        }}>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === location.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {location.name}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {form.formState.errors.parentCategory && (
                        <FormMessage>{form.formState.errors.parentCategory}</FormMessage>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            {form?.getValues("isOption") && (
              <div className="col-span-3 lg:col-span-1">
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <div className="mb-4 flex items-center gap-2">
                          <FormLabel className="text-base">Sub Category</FormLabel>
                          <Asterisk className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <DrawerSelectSubCategory allSubCategory={allSubCategory} field={field} />
                        </div>
                        {form.formState.errors.subCategory && (
                          <FormMessage>{form.formState.errors.subCategory}</FormMessage>
                        )}
                      </FormItem>
                    );
                  }}
                />
              </div>
            )}

            <div className="col-span-3">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/product-list")}
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

export default FormProduct;
