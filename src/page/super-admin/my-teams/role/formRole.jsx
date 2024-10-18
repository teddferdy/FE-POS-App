/* eslint-disable react/prop-types */
import React from "react"; // useState
// import { useMutation } from "react-query";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
// import { toast } from "sonner";
import { Asterisk } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import { useLoading } from "../../../../components/organism/loading";
import { Button } from "../../../../components/ui/button";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
// import { addRole, editRole } from "../../../../services/role";
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
import { Textarea } from "../../../../components/ui/textarea";
import { FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";
// import { useCookies } from "react-cookie";
import AccordionRole from "../../../../components/organism/accordion/role-accordion";

import {
  sidebarMenuSuperAdmin,
  sidebarMenuAdmin,
  sidebarMenuUser
} from "../../../../utils/sidebar-menu";

const FormRole = () => {
  const { state } = useLocation();
  // const [cookie] = useCookies();
  const navigate = useNavigate();
  // const { setActive } = useLoading();

  // State Super Admin
  // const [OverviewSuperAdmin, setSuperAdmin] = useState({
  //   title: "Super Admin",
  //   children: []
  // });

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Enter Name Role Minimum Character 4 & Max 30 Character."
    }),
    description: z.string().min(4, {
      message: "Enter Description Minimum Character 4 & Max 255 Character."
    }),
    status: z.boolean(),
    menu: z
      .array(
        z.object({
          title: z.string(),
          checked: z.boolean(),
          children: z.array(
            z.object({
              title: z.string(),
              checked: z.boolean(),
              actions: z.array(z.boolean())
            })
          )
        })
      )
      .refine(
        (menu) =>
          menu.some(
            (parent) =>
              parent.checked ||
              parent.children.some(
                (child) => child.checked || child.actions.some((action) => action)
              )
          ),
        {
          message: "At least one role or action must be selected."
        }
      )
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      description: state?.data?.description ?? "",
      status: state?.data?.status ?? true,
      menu: state?.data?.menu ?? []
    }
  });

  // QUERY
  // const mutateAddRole = useMutation(addRole, {
  //   onMutate: () => setActive(true, null),
  //   onSuccess: () => {
  //     setActive(false, "success");
  //     setTimeout(() => {
  //       toast.success("Success", {
  //         description: "Successfull, Added New Role"
  //       });
  //     }, 1000);
  //     setTimeout(() => {
  //       navigate("/role-list");
  //       setActive(null, null);
  //     }, 2000);
  //   },
  //   onError: (err) => {
  //     setActive(false, "error");
  //     setTimeout(() => {
  //       toast.error("Failed Add New Role", {
  //         description: err.message
  //       });
  //     }, 1500);
  //     setTimeout(() => {
  //       setActive(null, null);
  //     }, 2000);
  //   }
  // });

  // const mutateEditRole = useMutation(editRole, {
  //   onMutate: () => setActive(true, null),
  //   onSuccess: () => {
  //     setActive(false, "success");
  //     setTimeout(() => {
  //       toast.success("Success", {
  //         description: "Successfull, Edit Role"
  //       });
  //     }, 1000);
  //     setTimeout(() => {
  //       navigate("/role-list");
  //       setActive(null, null);
  //     }, 2000);
  //   },
  //   onError: (err) => {
  //     setActive(false, "error");
  //     setTimeout(() => {
  //       toast.error("Failed", {
  //         description: err.message
  //       });
  //     }, 1500);
  //     setTimeout(() => {
  //       setActive(null, null);
  //     }, 2000);
  //   }
  // });

  console.log("FORM =>", form.getValues("menu"));

  const onSubmit = (values) => {
    console.log("VALUES =>", values);

    // if (state?.data?.id) {
    //   const body = {
    //     id: state?.data?.id,
    //     name: values?.name,
    //     description: values?.description,
    //     status: values?.status,
    //     createdBy: state?.data?.createdBy,
    //     modifiedBy: cookie.user.userName
    //   };
    //   mutateEditRole.mutate(body);
    // } else {
    //   const body = {
    //     name: values?.name,
    //     description: values?.description,
    //     status: values?.status,
    //     createdBy: cookie.user.userName
    //   };

    //   mutateAddRole.mutate(body);
    // }
  };

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Form Role</h1>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      My Teams
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/my-teams-location-available">User</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/position-list">Position</BreadcrumbLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BreadcrumbLink href="/role-list">Role</BreadcrumbLink>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink>
                <BreadcrumbLink href="/role-list">Role List</BreadcrumbLink>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Role</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto p-4">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 space-y-8 p-4">
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      <FormLabel className="text-base">Name Role</FormLabel>
                      <Asterisk className="w-4 h-4 text-destructive" />
                    </div>
                    <Input type="text" {...field} placeholder="Enter name Role" maxLength={30} />

                    {form.formState.errors.name && (
                      <FormMessage>{form.formState.errors.name.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">Is Active</FormLabel>
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
            <div className="col-span-2 lg:col-span-3">
              <div className="flex justify-between">
                <div className="border-r border-l p-4 flex-1">
                  <h3>Super Admin Menu</h3>
                  <AccordionRole
                    menu={sidebarMenuSuperAdmin}
                    checkedValue={(val) => {
                      console.log("VAL =>", val);
                    }}
                  />
                </div>
                <div className="border-r p-4 flex-1">
                  <h3>Admin Menu</h3>
                  <AccordionRole menu={sidebarMenuAdmin} titleMenu="Admin" />
                </div>
                <div className="border-r p-4 flex-1">
                  <h3>User Menu</h3>
                  <AccordionRole menu={sidebarMenuUser} titleMenu="Admin" />
                </div>
              </div>
              {form.formState.errors.menu && (
                <FormMessage>
                  {Array.isArray(form.formState.errors.menu)
                    ? form.formState.errors.menu.map((err, index) => (
                        <div key={index}>{err.message}</div>
                      ))
                    : form.formState.errors.menu.message}
                </FormMessage>
              )}
            </div>
            <div className="col-span-2 lg:col-span-3">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/role-list")}
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
        </FormProvider>
      </div>
    </TemplateContainer>
  );
};

export default FormRole;
