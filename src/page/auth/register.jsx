import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
// import { Button } from "../../components/ui/button";
// import Input from "../../components/atom/input";
import PopUp from "../../components/organism/pop-up";
import { useLoading } from "../../components/organism/loading";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

// Services
import { register } from "../../services/auth";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js"
  },
  {
    value: "sveltekit",
    label: "SvelteKit"
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js"
  },
  {
    value: "remix",
    label: "Remix"
  },
  {
    value: "astro",
    label: "Astro"
  }
];

const Register = () => {
  const [showPopUp, setShowPopUp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { setActive } = useLoading();
  const navigate = useNavigate();

  const formSchema = z
    .object({
      userName: z.string().min(4, {
        message: "userName must be at least 4 characters."
      }),
      location: z.string().min(1, {
        message: "Location Field Required"
      }),
      password: z.string().min(4, {
        message: "Password must be at least 4 characters."
      }),
      email: z
        .string()
        .min(1, { message: "This field has to be filled." })
        .email("This is not a valid email."),
      confirmPassword: z.string().min(4, {
        message: "Confirmation Password must be at least 4 characters."
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
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

  // useEffect
  useEffect(() => {
    if (value) {
      form.setValue("location", value);
    }
  }, [value]);

  // QUERY
  const mutateRegister = useMutation(register, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        setShowPopUp("success");
      }, 1000);
      setTimeout(() => {
        navigate("/");
        setShowPopUp("");
        setActive(null, null);
      }, 2000);
    },
    onError: () => {
      setActive(false, "error");
      setTimeout(() => {
        setShowPopUp("error");
      }, 1500);
    }
  });

  const onSubmit = (values) => mutateRegister.mutate({ ...values, userType: "user" });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="w-full flex flex-col rounded p-[61px] h-screen overflow-x-scroll"
        defaultSize={55}
        maxSize={55}
        minSize={55}
        style={{
          overflow: "scroll"
        }}>
        <img src={Logo} className="w-1/4" alt="logo" />
        <div className="flex m-auto flex-col w-full md:w-10/12 xl:w-3/5 gap-4 mt-10">
          <p className="text-[#636363] text-[32px] font-semibold leading-[48px]">Register</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 items-center gap-2">
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">User Name</FormLabel>
                      </div>
                      <Input type="text" {...field} />
                      {form.formState.errors.userName && (
                        <FormMessage>{form.formState.errors.userName}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => {
                    console.log("FIELD =>", field);

                    return (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">location</FormLabel>
                        </div>
                        <Popover open={open} onOpenChange={setOpen} className="mt-10">
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between">
                              {value
                                ? frameworks.find((framework) => framework.value === value)?.label
                                : "Select framework..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search framework..." />
                              <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                <CommandGroup>
                                  {frameworks.map((framework) => (
                                    <CommandItem
                                      key={framework.value}
                                      value={framework.value}
                                      onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                      }}>
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {framework.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Email</FormLabel>
                      </div>
                      <Input type="email" {...field} />
                      {form.formState.errors.email && (
                        <FormMessage>{form.formState.errors.email}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
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
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Confirmation Password</FormLabel>
                      </div>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                        <div className="absolute top-[24%] right-[4%]">
                          <div
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="w-6 h-6 cursor-pointer">
                            <img
                              src={!showConfirmPassword ? HidePassword : ViewPassword}
                              alt="password"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <FormMessage>{form.formState.errors.confirmPassword}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 mt-4">
                <Button
                  type="submit"
                  className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                  Login
                </Button>
              </div>
            </form>
          </Form>
          <div className="flex justify-center items-center gap-2">
            <p className="text-[#CECECE] font-semibold text-lg">Jika sudah punya akun, silahkan</p>
            <Button
              className="font-semibold text-lg text-[#6853F0] hover:text-[#1ACB0A] duration-200 w-fit bg-transparent hover:bg-transparent p-0"
              onClick={() => navigate("/")}>
              Login
            </Button>
          </div>
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

      {/* Pop Up Error Login */}
      {showPopUp === "error" && (
        <PopUp
          title="Gagal Login"
          desc={mutateRegister?.error?.response?.data?.error || ""}
          btnAccText="Tutup"
          btnCloseText="Coba Lagi"
          withButton
          onCloseIcon={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
          funcBtnClose={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
          funcBtnAcc={() => {
            setShowPopUp("");
            setActive(null, null);
          }}
        />
      )}

      {/* Pop up Success Login */}
      {showPopUp === "success" && (
        <PopUp title="Sukses Login" desc="Login Sukses" withButton={false} />
      )}
    </ResizablePanelGroup>
  );
};

export default Register;
