import React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
// import { useTranslation } from "react-i18next";
import { useLoading } from "../../../../components/organism/loading";
import { Button } from "../../../../components/ui/button";
import DialogCancelForm from "../../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { addRole, editRole } from "../../../../services/role";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import TemplateContainer from "../../../../components/organism/template-container";
import { useCookies } from "react-cookie";
import Hint from "../../../../components/organism/label/hint";

const FormRole = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Precentage Filed Required"
    }),
    description: z.string().min(4, {
      message: "Description Field Required"
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
  const mutateAddRole = useMutation(addRole, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Role"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/role-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Role", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditRole = useMutation(editRole, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Role"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/role-list");
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
      mutateEditRole.mutate(body);
    } else {
      const body = {
        name: values?.name,
        description: values?.description,
        status: values?.status,
        createdBy: cookie.user.userName
      };

      mutateAddRole.mutate(body);
    }
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
                  <BreadcrumbLink href="/home">Cashier</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <BreadcrumbLink href="/role-list">Role List</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Form Role</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="w-full lg:w-3/4 mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Description</FormLabel>
                  </div>
                  <Input type="text" {...field} placeholder="Enter Description" />
                  {form.formState.errors.description ? (
                    <FormMessage>{form.formState.errors.description}</FormMessage>
                  ) : (
                    <Hint>Enter Description name Minimum Character 4</Hint>
                  )}
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="mb-4">
                      <FormLabel className="text-base">name</FormLabel>
                    </div>
                    <Input type="text" {...field} placeholder="Enter name Number" />

                    {form.formState.errors.name ? (
                      <FormMessage>{form.formState.errors.name}</FormMessage>
                    ) : (
                      <Hint>Enter name Number Cannot Character</Hint>
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
                      <Hint>Select yes if name want to active</Hint>
                    </div>
                  </FormItem>
                )}
              />
            </div>
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
          </form>
        </Form>
      </div>
    </TemplateContainer>
  );
};

export default FormRole;
