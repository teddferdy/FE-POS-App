import React from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
// import { useTranslation } from "react-i18next";

// Component
import { useLoading } from "../../../components/organism/loading";
import { Button } from "../../../components/ui/button";
import { AlarmClockPlus } from "lucide-react";
import DialogCancelForm from "../../../components/organism/dialog/dialogCancelForm";
import { Input } from "../../../components/ui/input";
import { Form, FormField, FormItem, FormLabel } from "../../../components/ui/form";
import TemplateContainer from "../../../components/organism/template-container";

// Services / Utils
import { addSocialMedia, editSocialMedia } from "../../../services/social-media";

const FormSocialMedia = () => {
  const { state } = useLocation();
  const [cookie] = useCookies();
  const navigate = useNavigate();
  const { setActive } = useLoading();
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name Social Media must be at least 2 characters."
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: state?.data?.name ?? ""
    }
  });

  // QUERY
  const mutateAddSocialMedia = useMutation(addSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Added New Social Media"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/social-media-list");
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

  const mutateEditSocialMedia = useMutation(editSocialMedia, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Successfull, Edit Social Media"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/social-media-list");
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
        createdBy: state?.data?.createdBy,
        modifiedBy: cookie.user.userName
      };
      mutateEditSocialMedia.mutate(body);
    } else {
      const body = {
        name: values?.name,
        createdBy: cookie.user.userName
      };
      mutateAddSocialMedia.mutate(body);
    }
  };

  return (
    <TemplateContainer>
      <div className="flex items-center gap-4 p-4">
        <AlarmClockPlus className="w-6 h-6" />
        <p>Add Social Media</p>
      </div>

      <div className="w-full lg:w-3/4 mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-2 w-3/4 gap-8 my-24 mx-auto lg:w-full">
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Name Social Media</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center">
                <DialogCancelForm
                  handleBack={() => navigate("/social-media-list")}
                  classNameButtonTrigger="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent"
                  titleDialog="Apakah Anda Ingin Membatalkan Ini"
                  titleButtonTrigger="Cancel"
                />
                <Button
                  className="py-2 px-4 w-fit bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200"
                  type="submit">
                  Add Shift
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </TemplateContainer>
  );
};

export default FormSocialMedia;
