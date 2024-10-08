import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, ChevronDown, TrashIcon, PlusIcon } from "lucide-react";
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
import { Switch } from "../../../../components/ui/switch";
import { Separator } from "../../../../components/ui/separator";
import Hint from "../../../../components/organism/label/hint";

// Services
import { addSubCategory, editSubCategory } from "../../../../services/sub-category";
import { getAllCategory } from "../../../../services/category";

const userInfoSchema = z.object({
  name: z.string(),
  price: z.string(),
  isFree: z.boolean()
});

const FormSubCategory = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const { setActive } = useLoading();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    nameSubCategory: z.string().min(4, {
      message: "Name Sub Category Store must be at least 4 characters."
    }),
    parentCategory: z.string().min(4, {
      message: "Name Product Store must be at least 4 characters."
    }),
    option: z.boolean(),
    isMultiple: z.boolean(),
    typeSubCategory: z.array(userInfoSchema)
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      nameSubCategory: state?.data?.nameSubCategory || "",
      parentCategory: state?.data?.parentCategory || "",
      isMultiple: state?.data?.isMultiple ?? false,
      option: state?.data?.option ?? false,
      typeSubCategory: state?.data?.typeSubCategory || []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    name: "typeSubCategory",
    control: form.control
  });

  // QUERY
  const allCategory = useQuery(["get-all-category"], () => getAllCategory(), {
    keepPreviousData: false
  });

  const mutateAddSubCategory = useMutation(addSubCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Sub Category"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/sub-category-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Sub Category", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditSubCategory = useMutation(editSubCategory, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Sub Category"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/sub-category-list");
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

  const handleInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const onSubmit = (values) => {
    if (state?.data?.id) {
      const body = {
        id: state?.data?.id,
        parentCategory: values?.parentCategory,
        nameSubCategory: values?.nameSubCategory,
        typeSubCategory:
          values?.typeSubCategory?.length > 0 ? JSON.stringify(values?.typeSubCategory) : "",
        isMultiple: values?.isMultiple,
        store: cookie?.user?.location,
        createdBy: state?.data?.userName,
        modifiedBy: cookie.user.userName
      };
      mutateEditSubCategory.mutate(body);
    } else {
      const body = {
        parentCategory: values?.parentCategory,
        nameSubCategory: values?.nameSubCategory,
        typeSubCategory:
          values?.typeSubCategory?.length > 0 ? JSON.stringify(values?.typeSubCategory) : "",
        isMultiple: values?.isMultiple,
        store: cookie?.user?.location,
        createdBy: cookie?.user?.userName
      };

      mutateAddSubCategory.mutate(body);
    }
  };

  const handlePrimaryFloorChange = (val, idx) => {
    form.getValues("typeSubCategory").map((items, index) => {
      if (index === idx) {
        return {
          ...items,
          price: val ? "0" : items.price,
          isFree: val
        };
      }
      return { ...items };
    });

    const datas = form.getValues("typeSubCategory").map((items, index) => {
      if (index === idx) {
        return {
          ...items,
          price: val ? "0" : items.price,
          isFree: val
        };
      }
      return { ...items };
    });
    form.setValue("typeSubCategory", datas);
  };

  const ADDING_OPTION = useMemo(() => {
    if (form.getValues("option")) {
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
                        <FormLabel className="text-base">Name Option {numb}</FormLabel>
                      </div>
                      <Input
                        type="text"
                        {...form.register(`typeSubCategory.${index}.name`)}
                        defaultValue={items.titleOption}
                        placeholder="Enter Name Option"
                      />
                      {items?.titleOption?.length < 1 ? (
                        <FormMessage>Name Option Must Be Filled</FormMessage>
                      ) : (
                        <Hint>Enter Name Option Minimum 2 Character</Hint>
                      )}
                    </FormItem>
                  </div>
                  <div className="flex-1 flex-col">
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Option Price {numb}</FormLabel>
                      </div>
                      {items.isFree ? (
                        <Input
                          type="text"
                          disabled={items.isFree}
                          value="0"
                          {...form.register(`typeSubCategory.${index}.price`)}
                          defaultValue={items.price}
                          placeholder="Enter Price Option"
                          onInput={handleInput}
                        />
                      ) : (
                        <Input
                          type="text"
                          {...form.register(`typeSubCategory.${index}.price`)}
                          defaultValue={items.price}
                          placeholder="Enter Price Option"
                          onInput={handleInput}
                        />
                      )}
                      <Hint>If Free switch position on yes, Input Price automated in Rp. 0</Hint>
                    </FormItem>
                    <div className="flex justify-between mt-6">
                      <div className="flex-col">
                        <FormLabel className="text-base">Is Free</FormLabel>
                        <Hint>Select yes if option price 0 / free</Hint>
                      </div>
                      <div className="flex items-center gap-6 mb-4">
                        <p>No</p>
                        <Switch
                          name="isFree"
                          checked={items.isFree}
                          onCheckedChange={(e) => handlePrimaryFloorChange(e, index)}
                        />
                        <p>Yes</p>
                      </div>
                    </div>
                  </div>
                  {/* Delete on Resolution Table - Desktop */}
                  <div
                    className="justify-end self-center -mt-14 hidden md:flex"
                    onClick={() => {
                      if (fields?.length === 1) {
                        form.setValue("option", false);
                        form.setValue("typeSubCategory", []);
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
                        form.setValue("typeSubCategory", []);
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
    } else {
      return null;
    }
  }, [form.getValues("option"), form, fields, remove, update]);

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Form Sub Category</h1>
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
                <BreadcrumbLink href="/sub-category-list">Sub Category List</BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Sub Category" : "Form Add Sub Category"}
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
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="nameSubCategory"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Name Sub Category</FormLabel>
                    </div>
                    <Input type="text" {...field} placeholder="Enter Name Product" />
                    {form.formState.errors.nameSubCategory ? (
                      <FormMessage>{form.formState.errors.nameSubCategory}</FormMessage>
                    ) : (
                      <Hint>Enter Name Product Minimum 4 Character</Hint>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="parentCategory"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Parent Category</FormLabel>
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
                                      onSelect={(currentValue) => field.onChange(currentValue)}>
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
                      {form.formState.errors.parentCategory ? (
                        <FormMessage>{form.formState.errors.parentCategory}</FormMessage>
                      ) : (
                        <Hint>Select Sub Category From Category Product</Hint>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="option"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Adding Option</FormLabel>
                    </div>
                    <div className="flex-col">
                      <div className="flex items-center gap-6 mb-4">
                        <p>No</p>
                        <Switch
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(e) => {
                            field.onChange(e);
                            if (e) {
                              append({
                                name: "",
                                price: "",
                                isFree: false
                              });
                            } else {
                              form.setValue("typeSubCategory", []);
                            }
                          }}
                        />
                        <p>Yes</p>
                      </div>
                      <Hint>Select yes if you want to adding option</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="isMultiple"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Is Multiple</FormLabel>
                    </div>
                    <div className="flex-col">
                      <div className="flex items-center gap-6 mb-4">
                        <p>No</p>
                        <Switch
                          name={field.name}
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <p>Yes</p>
                      </div>
                      <Hint>Select yes if customer can choose more than one option</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {/* Form Adding Option */}
            {ADDING_OPTION}
            {/* End Form Adding Option */}

            {/* Button Adding Option */}
            {form.getValues("option") && (
              <div className="col-span-2 flex justify-center cursor-pointer">
                <div
                  className="col-span-2 flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  onClick={() =>
                    append({
                      name: "",
                      price: "",
                      isFree: false
                    })
                  }>
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Option</span>
                </div>
              </div>
            )}

            <div className="col-span-2">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/sub-category-list")}
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

export default FormSubCategory;
