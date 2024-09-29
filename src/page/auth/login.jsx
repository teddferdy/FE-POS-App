/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";

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
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useLoading } from "../../components/organism/loading";

// Services
import { login } from "../../services/auth";

// Utils & State
import { translationSelect } from "../../state/translation";
import { TRANSLATION } from "../../utils/translation";

const Login = () => {
  const { setActive } = useLoading();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [_, setCookie] = useCookies();

  const [showPassword, setShowPassword] = useState(false);
  const { updateTranslation, translation } = translationSelect();

  console.log("translation =>", translation);

  // Translation
  const translationMemo = useMemo(() => {
    return {
      title: t("translation:login"),
      userName: t("translation:userNameOrEmail"),
      password: t("translation:password"),
      btnLogin: t("translation:btnLogin"),
      selectLanguage: t("translation:selectLanguage"),
      btnCreateAcc: t("translation:btnCreateAcc"),
      btnResetPassword: t("translation:btnResetPassword"),
      sidebarAuth: t("translation:descAuth"),

      // Placeholder
      placeholderInputUser: t("translation:placeholder.input.login.username"),
      placeholderInputPassword: t("translation:placeholder.input.login.password"),

      // Error
      errorMessageUserName: t("translation:formError.input.login.username"),
      errorMessagePassword: t("translation:formError.input.login.password")
    };
  }, [t]);

  const formSchema = useMemo(() => {
    return z.object({
      userName: z.string().min(1, {
        message: translationMemo.errorMessageUserName
      }),
      password: z.string().min(1, {
        message: translationMemo.errorMessagePassword
      })
    });
  }, [translation, translationMemo]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: ""
    }
  });

  // QUERY
  const mutateLogin = useMutation(login, {
    onMutate: () => setActive(true, null),
    onSuccess: (success) => {
      setCookie("token", success.token);
      setCookie("user", success.user);

      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Welcome, Login User successfully"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/home");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Login", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const onSubmit = (values) => mutateLogin.mutate(values);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="w-full flex flex-col rounded p-[61px] h-screen overflow-x-scroll no-scrollbar"
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
            <SelectTrigger className="w-fit border-hidden bg-[#6853F0] hover:bg-[#1ACB0A] duration-200">
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
                  <SelectItem value={items.value} className="w-full flex items-center" key={index}>
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
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-3/5 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">
            {translationMemo.title}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    {form?.formState?.errors?.userName && (
                      <FormMessage>{form?.formState?.errors?.userName}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
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
                    {form?.formState?.errors?.password && (
                      <FormMessage>{form?.formState?.errors?.password}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  type="submit"
                  className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                  {translationMemo.btnLogin}
                </Button>
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => navigate("/register")}
                    className="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent">
                    {translationMemo.btnCreateAcc}
                  </Button>
                  <Button
                    onClick={() => navigate("/reset-password")}
                    className="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent">
                    {translationMemo.btnResetPassword}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
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

export default Login;
