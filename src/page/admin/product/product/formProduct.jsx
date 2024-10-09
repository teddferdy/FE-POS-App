import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react";
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
import DialogCarouselImage from "../../../../components/organism/dialog/dialog-carousel-image";
import { cn } from "../../../../lib/utils";
import { useLoading } from "../../../../components/organism/loading";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import TemplateContainer from "../../../../components/organism/template-container";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import { generateLinkImageFromGoogleDrive } from "../../../../utils/generateLinkImageFromGoogleDrive";
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
import Hint from "../../../../components/organism/label/hint";

// Services
import { addProduct } from "../../../../services/product";
import { getAllCategory } from "../../../../services/category";
import { getSubCategoryByCategory } from "../../../../services/sub-category";

const userInfoSchema = z.object({
  nameSubCategory: z.string(),
  parentCategory: z.string(),
  typeSubCategory: z.string(),
  isMultiple: z.boolean()
});

const FormProduct = () => {
  const { state } = useLocation();
  const [cookie] = useCookies(["user"]);
  console.log("cookie =>", cookie);

  const { setActive } = useLoading();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleInput = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = value;
  };

  const formSchema = z.object({
    image: z.string().min(4, {
      message: "Image Store must be at least 4 characters."
    }),
    nameProduct: z.string().min(4, {
      message: "Name Product Store must be at least 4 characters."
    }),
    category: z.string().min(4, {
      message: "Category Must Be Selected."
    }),
    description: z.string().min(4, {
      message: "Description Store must be at least 4 characters."
    }),
    price: z.string().min(2, {
      message: "Price Product Must Number And Not Alphabet"
    }),
    status: z.boolean(),
    store: z.string(),
    subCategory: z.array(userInfoSchema)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      image: "",
      nameProduct: "",
      category: "",
      status: true,
      description: "",
      store: "",
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
        status: values?.status,
        price: values?.price,
        option: JSON.stringify(values?.subCategory),
        store: cookie?.user?.location,
        createdBy: cookie?.user?.userName
      };

      mutateAddProduct.mutate(body);
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
                  <BreadcrumbLink href="/admin-page">Dashboard</BreadcrumbLink>
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
                render={({ field }) => {
                  const linkName = generateLinkImageFromGoogleDrive(field.value);
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Image Product</FormLabel>
                      </div>
                      <div className="flex-col md:flex justify-between gap-10">
                        <div className="flex flex-col gap-4">
                          <div className="relative w-full">
                            <Input
                              type="text"
                              {...field}
                              className="flex-1"
                              placeholder="Enter Image URL"
                            />
                            <div className="absolute right-0 top-0 h-full w-10 text-gray-400 cursor-pointer bg-slate-300 flex justify-center items-center rounded-lg">
                              <DialogCarouselImage />
                            </div>
                          </div>
                          {form.formState.errors.image ? (
                            <FormMessage>{form.formState.errors.image}</FormMessage>
                          ) : (
                            <Hint>Image URL in Google Drive</Hint>
                          )}
                        </div>
                        {linkName && (
                          <div className="flex flex-col gap-4">
                            <p>Result Image</p>
                            <div className="w-full md:w-72 h-auto mt-10 md:mt-0 border-4 border-dashed border-gray-500 rounded-lg p-2">
                              <img
                                src={`${linkName}`}
                                alt={linkName}
                                className="w-full object-cover"
                              />
                            </div>
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
                    <Input type="text" {...field} placeholder="Enter Name Product" maxLength={30} />
                    {form.formState.errors.nameProduct ? (
                      <FormMessage>{form.formState.errors.nameProduct}</FormMessage>
                    ) : (
                      <Hint>Enter Name Product Minimum Character 4 and max character 30</Hint>
                    )}
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
                    <Textarea {...field} placeholder="Enter Description Product" maxLength={255} />
                    {form.formState.errors.description ? (
                      <FormMessage>{form.formState.errors.description}</FormMessage>
                    ) : (
                      <Hint>Enter Minimum 4 Character & Max 255 Character</Hint>
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
                    <div className="mb-4">
                      <FormLabel className="text-base">Price Product</FormLabel>
                    </div>
                    <Input
                      type="text"
                      {...field}
                      placeholder="Enter Price Product"
                      onInput={handleInput}
                    />
                    {form.formState.errors.price ? (
                      <FormMessage>{form.formState.errors.price}</FormMessage>
                    ) : (
                      <Hint>Price Product Must Number And Not Alphabet</Hint>
                    )}
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
            <div className="col-span-3 lg:col-span-1">
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
                      {form.formState.errors.category ? (
                        <FormMessage>{form.formState.errors.category}</FormMessage>
                      ) : (
                        <Hint>Select Category Product</Hint>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            {form?.getValues("category") && (
              <div className="col-span-3 lg:col-span-1">
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
                        {form.formState.errors.subCategory ? (
                          <FormMessage>{form.formState.errors.subCategory}</FormMessage>
                        ) : (
                          <Hint>Select Sub Category Product</Hint>
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
