import React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import moment from "moment";
import { useCookies } from "react-cookie";
// import { useTranslation } from "react-i18next";

// Component
import { useLoading } from "../../../components/organism/loading";
import { Button } from "../../../components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../../components/ui/breadcrumb";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import TimePicker from "../../../components/organism/picker/time-picker";
import { Form, FormField, FormItem, FormLabel } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";

// Services / Utils
import { addShift, editShift } from "../../../services/shift";

const FormShift = () => {
  const dateNow = new Date();
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    nameShift: z.string().min(2, {
      message: "Name Shift must be at least 2 characters."
    }),
    description: z.string().min(4, {
      message: "Description must be at least 4 characters."
    }),
    startHour: z.date(),
    endHour: z.date(),
    status: z.boolean()
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameShift: state?.data?.nameShift ?? "",
      description: state?.data?.description ?? "",
      startHour: state?.data?.startHour
        ? new Date(`01/01/2020 ${state?.data?.startHour}`)
        : dateNow,
      endHour: state?.data?.endHour ? new Date(`01/01/2020 ${state?.data?.endHour}`) : dateNow,
      status: state?.data?.status ?? true
    }
  });

  // QUERY
  const mutateAddShift = useMutation(addShift, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Shift"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/shift-list");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Add New Shift", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const mutateEditShift = useMutation(editShift, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Shift"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/shift-list");
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
        nameShift: values?.nameShift,
        description: values?.description,
        startHour: moment(values?.startHour).format("HH:mm:ss"),
        endHour: moment(values?.endHour).format("HH:mm:ss"),
        status: values?.status,
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditShift.mutate(body);
    } else {
      const body = {
        nameShift: values?.nameShift,
        description: values?.description,
        startHour: moment(values?.startHour).format("HH:mm:ss"),
        endHour: moment(values?.endHour).format("HH:mm:ss"),
        status: values?.status,
        createdBy: cookie.user.userName
      };
      mutateAddShift.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex justify-between mb-6 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#6853F0] text-lg font-bold">Form Shift</h1>
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
                  <BreadcrumbLink href="/shift-list">Shift List</BreadcrumbLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {state?.data?.id ? "Form Edit Shift" : "Form Add Shift"}
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
            className="grid grid-cols-1 lg:grid-cols-2 w-3/4 gap-8 my-24 mx-auto lg:w-full ">
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="nameShift"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Name Shift</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Description</FormLabel>
                      </div>
                      <Textarea {...field} maxLength={255} />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="flex py-6 items-start gap-6 justify-between col-span-2">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Start Hour</FormLabel>
                        </div>
                        <TimePicker setDate={field.onChange} date={field.value} withSecondInput />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="flex-1 flex-col">
                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">End Hour</FormLabel>
                        </div>
                        <TimePicker setDate={field.onChange} date={field.value} withSecondInput />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="flex justify-end self-center -mt-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="mb-4">
                        <FormLabel className="text-base">Is Active</FormLabel>
                      </div>
                      <div className="flex items-center gap-6">
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
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/shift-list")}
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

export default FormShift;
