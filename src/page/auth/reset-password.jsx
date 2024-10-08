import React, { useState, useMemo } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";

// Assets
import { Eye, EyeOff } from "lucide-react";
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";

// Component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel
} from "../../components/ui/select";
import { ResizablePanel, ResizablePanelGroup } from "../../components/ui/resizable";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useLoading } from "../../components/organism/loading";

// Services
import { resetPassword } from "../../services/auth";

// Utils & State
import { translationSelect } from "../../state/translation";
import { TRANSLATION } from "../../utils/translation";

const ResetPassword = () => {
  const { setActive } = useLoading();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { updateTranslation, translation } = translationSelect();

  const { t } = useTranslation();
  // Translation
  const translationMemo = useMemo(() => {
    return {
      title: t("translation:resetPassword"),
      userName: t("translation:userName"),
      password: t("translation:newPassword"),
      confirmationPassword: t("translation:confirmationNewPassword"),
      descRegister: t("translation:descRegister"),
      btnLogin: t("translation:btnLogin"),
      selectLanguage: t("translation:selectLanguage"),
      btnCreateAcc: t("translation:btnCreateAcc"),
      btnResetPassword: t("translation:btnResetPassword"),
      sidebarAuth: t("translation:descAuth"),

      // Placeholder
      placeholderInputUser: t("translation:placeholder.input.resetPassword.username"),
      placeholderInputPassword: t("translation:placeholder.input.password.username"),
      placeholderInputConfirmationPassword: t(
        "translation:placeholder.input.password.confirmationPassword"
      ),

      // Error
      errorMessageUserName: t("translation:formError.input.register.username"),
      errorMessagePassword: t("translation:formError.input.register.password"),
      errorMessageConfirmationPassword: t(
        "translation:formError.input.register.confirmationPassword"
      ),
      errorMessageValidationConfirmationPassword: t(
        "translation:formError.input.register.validationConfirmationPassword"
      )
    };
  }, [t]);

  const formSchema = z
    .object({
      userName: z.string().min(4, {
        message: translationMemo.errorMessageUserName
      }),
      password: z.string().min(4, {
        message: translationMemo.errorMessagePassword
      }),
      confirmPassword: z.string().min(4, {
        message: translationMemo.errorMessageConfirmationPassword
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: translationMemo.errorMessageValidationConfirmationPassword,
      path: ["confirmPassword"]
    });

  // QUERY
  const mutateResetPassword = useMutation(resetPassword, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Profile updated successfully"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/");
        setActive(null, null);
      }, 2000);
    },
    onError: () => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Error", {
          description: "Failed to Reset Password"
        });
      }, 1500);
    }
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: "",
      email: "",
      location: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (values) => {
    const { userName, password } = values;
    const body = {
      userName,
      password
    };
    mutateResetPassword.mutate(body);
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="w-full flex flex-col rounded p-8 md:p-[61px] h-screen overflow-x-scroll no-scrollbar"
        defaultSize={55}
        maxSize={55}
        minSize={55}
        style={{
          overflow: "scroll"
        }}>
        <div className="flex items-center justify-between">
          <img src={Logo} className="w-1/4" alt="logo" />
          <Select
            onValueChange={(e) => updateTranslation(e)}
            value={localStorage.getItem("translation")}>
            <SelectTrigger
              classNameIcon="w-5 h-5"
              className="w-fit border-hidden bg-[#6853F0] hover:bg-[#1ACB0A] duration-200 flex items-center gap-2 text-white ring-0 focus:ring-0">
              {TRANSLATION?.filter((items) => items.value === translation)?.map((items, index) => (
                <img src={items.img} alt={items.name} className="max-w-6 max-h-6" key={index} />
              ))}
            </SelectTrigger>
            <SelectContent
              className="min-w-2 z-50"
              defaultValue={
                TRANSLATION?.filter((items) => items.value === translation)?.map(
                  (items) => items.value
                )?.[0]
              }>
              <SelectGroup>
                <SelectLabel>{translationMemo.selectLanguage}</SelectLabel>
                {TRANSLATION.map((items, index) => (
                  <SelectItem
                    value={items.value}
                    className="w-full flex items-center focus:bg-[#1ACB0A] focus:text-white"
                    key={index}>
                    <div className="flex justify-between items-center gap-4">
                      <img src={items.img} alt={items.name} className="max-w-6 max-h-6" />
                      <p>{items.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex xl:m-auto flex-col w-full xl:w-3/5 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">
            {translationMemo.title}
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 items-center gap-2">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">{translationMemo.userName}</FormLabel>
                      </div>
                      <Input
                        type="text"
                        {...field}
                        placeholder={translationMemo.placeholderInputUser}
                      />
                      {form.formState.errors.userName && (
                        <FormMessage>{form.formState.errors.userName}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">{translationMemo.password}</FormLabel>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          placeholder={translationMemo.placeholderInputPassword}
                        />
                        <div className="absolute top-[24%] right-[4%]">
                          {showPassword ? (
                            <Eye
                              color="#6853F0"
                              className="w-6 h-6 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          ) : (
                            <EyeOff
                              className="w-6 h-6 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          )}
                        </div>
                      </div>
                      {form.formState.errors.password && (
                        <FormMessage>{form.formState.errors.password}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {translationMemo.confirmationPassword}
                        </FormLabel>
                      </div>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          placeholder={translationMemo.placeholderInputConfirmationPassword}
                        />
                        <div className="absolute top-[24%] right-[4%]">
                          {showConfirmPassword ? (
                            <Eye
                              color="#6853F0"
                              className="w-6 h-6 cursor-pointer"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                          ) : (
                            <EyeOff
                              className="w-6 h-6 cursor-pointer"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                          )}
                        </div>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <FormMessage>{form.formState.errors.confirmPassword}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 mt-8">
                <Button
                  type="submit"
                  className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                  {translationMemo.btnResetPassword}
                </Button>
              </div>
            </form>
          </Form>

          <p className="text-[#CECECE] font-semibold text-lg text-center">
            {translationMemo.descRegister}{" "}
            <Button
              className="font-semibold text-lg text-[#6853F0] hover:text-[#1ACB0A] duration-200 w-fit bg-transparent hover:bg-transparent p-0"
              onClick={() => navigate("/")}>
              {translationMemo.btnLogin}
            </Button>
          </p>
        </div>
      </ResizablePanel>
      <ResizablePanel
        className="hidden lg:block w-full bg-indigo-700 p-[71px]"
        defaultSize={45}
        maxSize={45}
        minSize={45}>
        <div className="bg-[#ADA3EC] h-full rounded-3xl flex flex-col relative">
          <p className="text-[25px] px-[43px] py-[43px] xl:px-[81px] xl:text-[32px] font-bold text-white">
            {translationMemo.sidebarAuth}
          </p>
          <div className="absolute top-[42%] -left-8 overflow-hidden">
            <img src={MiniLogo} className="w-16 h-16 object-cover" alt="mini-logo" />
          </div>
          <div className="overflow-hidden self-end flex-1 absolute bottom-0 h-[70%]">
            <img
              className="w-full h-full object-contain group-hover:scale-125 group-hover:rotate-3 duration-500"
              src={ImageUser}
              alt="logo-person"
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResetPassword;
