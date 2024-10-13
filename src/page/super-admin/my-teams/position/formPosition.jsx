import React from "react";
import { useMutation } from "react-query";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Asterisk } from "lucide-react";
// import { useTranslation } from "react-i18next";
import { useLoading } from "../../../../components/organism/loading";
import { Button } from "../../../../components/ui/button";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addPosition, editPosition } from "../../../../services/position";
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
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import { Textarea } from "../../../../components/ui/textarea";
import TemplateContainer from "../../../../components/organism/template-container";
import { useCookies } from "react-cookie";

const FormPosition = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Enter Name Position Minimum Character 4 & Max 30 Character."
    }),
    description: z.string().min(4, {
      message: "Enter Description Position Minimum Character 4 & Max 255 Character."
    }),

    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? "",
      description: state?.data?.description ?? "",
      status: state?.data?.status ?? true
    }
  });

  // QUERY
  const mutateAddPosition = useMutation(addPosition, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Position"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/position-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Position", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditPosition = useMutation(editPosition, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Position"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/position-list");
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
        name: values?.name,
        description: values?.description,
        status: values?.status,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditPosition.mutate(body);
    } else {
      const body = {
        name: values?.name,
        description: values?.description,
        status: values?.status,
        createdBy: cookie.user.userName
      };

      mutateAddPosition.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-[#6853F0] text-lg font-bold">Position</h1>
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
              <BreadcrumbLink href="/position-list">Position List</BreadcrumbLink>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Position</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="w-full lg:w-3/4 mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="mb-4 flex items-center gap-2">
                    <FormLabel className="text-base">Name Position</FormLabel>
                    <Asterisk className="w-4 h-4 text-destructive" />
                  </div>
                  <Input type="text" {...field} placeholder="Enter name Position" maxLength={30} />
                  {form.formState.errors.name && (
                    <FormMessage>{form.formState.errors.name}</FormMessage>
                  )}
                </FormItem>
              )}
            />
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
            <div className="flex justify-between items-center">
              <DialogCancelForm
                handleBack={() => navigate("/position-list")}
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
          </form>
        </Form>
      </div>
    </TemplateContainer>
  );
};

export default FormPosition;
