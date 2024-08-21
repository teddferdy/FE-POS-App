import React, { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Assets
import ImageUser from "../../assets/logo-auth.png";
import MiniLogo from "../../assets/mini-logo.png";
import Logo from "../../assets/logo.png";
import ViewPassword from "../../assets/view-password.png";
import HidePassword from "../../assets/hide-password.png";

// Component
import { ResizablePanel, ResizablePanelGroup } from "../../components/ui/resizable";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useLoading } from "../../components/organism/loading";

// Services
import { login } from "../../services/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setActive } = useLoading();
  const navigate = useNavigate();

  const formSchema = z.object({
    userName: z.string().min(4, {
      message: "Username must be at least 4 characters."
    }),
    password: z.string().min(4, {
      message: "Password must be at least 4 characters."
    })
  });

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
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Register User successfully"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/home");
        setActive(null, null);
      }, 2000);
    },
    onError: () => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Custom Title 1", {
          description: "Failed to Register User"
        });
      }, 1500);
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
        <img src={Logo} className="w-1/4" alt="logo" />
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-3/5 gap-11">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">Login</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">User Name / Email</FormLabel>
                    </div>
                    <Input type="text" {...field} />
                    {form.formState.errors.userName && (
                      <FormMessage>{form.formState.errors.userName}</FormMessage>
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
                      <FormLabel className="text-base">Password</FormLabel>
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...field} />
                      <div className="absolute top-[24%] right-[4%]">
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="w-6 h-6 cursor-pointer">
                          <img
                            src={!showPassword ? HidePassword : ViewPassword}
                            alt="password"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    {form.formState.errors.password && (
                      <FormMessage>{form.formState.errors.password}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  type="submit"
                  className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                  Login
                </Button>
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => navigate("/register")}
                    className="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent">
                    Buat Akun
                  </Button>
                  <Button
                    onClick={() => navigate("/reset-password")}
                    className="text-[#CECECE] bg-transparent font-semibold hover:text-[#1ACB0A] text-lg hover:bg-transparent">
                    Lupa Password ?
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
            Optimalkan Efisiensi Transaksi, Tingkatkan Keuntungan
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
