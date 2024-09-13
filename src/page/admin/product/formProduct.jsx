import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MapPinPlus, Check, ChevronsUpDown } from "lucide-react";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";

// Component
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { useLoading } from "../../../components/organism/loading";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import TemplateContainer from "../../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel } from "../../../components/ui/form";
import { generateLinkImageFromGoogleDrive } from "../../../utils/generateLinkImageFromGoogleDrive";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../../components/ui/command";
import DrawerSelectSubCategory from "../../../components/organism/drawer/drawer-select-sub-category";

// Services
import { addProduct } from "../../../services/product";
import { getAllCategory } from "../../../services/category";
import { getSubCategoryByCategory } from "../../../services/sub-category";

const userInfoSchema = z.object({
  nameSubCategory: z.string(),
  parentCategory: z.string(),
  typeSubCategory: z.string(),
  isMultiple: z.boolean()
});

const FormProduct = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const { setActive } = useLoading();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    image: z.string().min(4, {
      message: "Image Store must be at least 4 characters."
    }),
    nameProduct: z.string().min(4, {
      message: "Name Product Store must be at least 4 characters."
    }),
    category: z.string().min(4, {
      message: "Name Product Store must be at least 4 characters."
    }),
    description: z.string().min(4, {
      message: "Description Store must be at least 4 characters."
    }),
    price: z.string().min(2, {
      message: "Price Product must be at least 2 characters."
    }),
    subCategory: z.array(userInfoSchema)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      image: "",
      nameProduct: "",
      category: "",
      description: "",
      subCategory: []
    }
  });

  // QUERY
  const allCategory = useQuery(["get-all-category"], () => getAllCategory(), {
    keepPreviousData: false
  });

  const allSubCategory = useQuery(
    ["get-all-sub-category", form.getValues("category")],
    () => getSubCategoryByCategory(form.getValues("category")),
    {
      enabled: !!form.getValues("category"),
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
  const onSubmit = (values) => {
    console.log("values =>", values);

    if (state?.data?.id) {
      //   const body = {
      //     id: state?.data?.id,
      //     nameStore: values?.nameStore,
      //     address: values?.address,
      //     detailLocation: values?.detailLocation,
      //     phoneNumber: values?.phoneNumber,
      //     status: true,
      //     createdBy: state?.data?.createdBy,
      //     modifiedBy: cookie.user.userName
      //   };
      //   mutateEditLocation.mutate(body);
    } else {
      const body = {
        nameProduct: values?.nameProduct,
        image: values?.image,
        category: values?.category,
        description: values?.description,
        price: values?.price,
        option: JSON.stringify(values?.subCategory),
        createdBy: cookie?.user?.userName
      };

      mutateAddProduct.mutate(body);
    }
  };

  return (
    <TemplateContainer setOpenMenu={(val) => setOpenMenu(val)} openMenu={openMenu}>
      <main className="border-t-2 border-[#ffffff10] overflow-scroll flex flex-col gap-8 max-h-full no-scrollbar">
        <section>
          <div className="flex items-center gap-4">
            <MapPinPlus className="w-6 h-6" />
            <p>Add Product</p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-24 mx-auto lg:w-3/6 w-3/4 overflow-hidden">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => {
                    const linkName = generateLinkImageFromGoogleDrive(field.value);
                    return (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Image Product</FormLabel>
                        </div>
                        <div className="flex justify-between gap-10">
                          <Input type="text" {...field} className="flex-1" />
                          {linkName && (
                            <div className="flex-1 w-48 h-48">
                              <img
                                src={`${linkName}`}
                                alt={linkName}
                                className="w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="nameProduct"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Name Product</FormLabel>
                      </div>
                      <Input type="text" {...field} />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3 lg:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Description</FormLabel>
                      </div>
                      <Textarea {...field} />
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
                      <div className="mb-4">
                        <FormLabel className="text-base">Price Product</FormLabel>
                      </div>
                      <Input type="text" {...field} />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Category</FormLabel>
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
                                      (location) => location.name === field.value
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
                                    {allCategory?.data?.data?.map((location) => (
                                      <CommandItem
                                        key={location.name}
                                        value={location.name}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue);
                                          form.setValue("subCategory", []);
                                          setOpen(false);
                                        }}>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === location.name
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {location.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </FormItem>
                    );
                  }}
                />
              </div>
              {form?.getValues("category") && (
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel className="text-base">Sub Category</FormLabel>
                          </div>
                          <DrawerSelectSubCategory allSubCategory={allSubCategory} field={field} />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}

              <div className="col-span-3">
                <div className="flex justify-between items-center">
                  <DialogCancelForm
                    classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                    titleDialog="Apakah Anda Ingin Membatalkan Ini"
                    titleButtonTrigger="Cancel"
                  />
                  <Button
                    className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                    type="submit">
                    Add Product
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </section>
      </main>
    </TemplateContainer>
  );
};

export default FormProduct;
