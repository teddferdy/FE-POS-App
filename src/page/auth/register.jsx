import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";

// Assets
import { Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
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
import { useLoading } from "../../components/organism/loading";
import { Button } from "../../components/ui/button";

import { cn } from "../../lib/utils";
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
import { getAllLocation } from "../../services/location";

// Utils & State
import { translationSelect } from "../../state/translation";
import { TRANSLATION } from "../../utils/translation";

const Register = () => {
  const { setActive } = useLoading();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const { updateTranslation, translation } = translationSelect();
  const allLocation = useQuery(["get-all-location"], () => getAllLocation(), {
    retry: 0,
    keepPreviousData: true
  });
  const selectedLocation = value
    ? allLocation?.data?.data?.find((location) => location.id === value)
    : null;

  // Translation
  const translationMemo = useMemo(() => {
    return {
      title: t("translation:register"),
      login: t("translation:login"),
      userName: t("translation:userName"),
      password: t("translation:password"),
      email: t("translation:email"),
      location: t("translation:location"),
      confirmationPassword: t("translation:confirmationPassword"),
      descRegister: t("translation:descRegister"),
      selectLanguage: t("translation:selectLanguage"),
      sidebarAuth: t("translation:descAuth"),

      // Placeholder
      placeholderInputUser: t("translation:placeholder.input.register.username"),
      placeholderInputEmail: t("translation:placeholder.input.register.email"),
      placeholderInputLocation: t("translation:placeholder.input.register.location"),
      placeholderInputPassword: t("translation:placeholder.input.register.password"),
      placeholderInputConfirmationPassword: t(
        "translation:placeholder.input.register.confirmationPassword"
      ),

      // Error
      errorMessageUserName: t("translation:formError.input.register.username"),
      errorMessageUserEmail: t("translation:formError.input.register.email"),
      errorMessageValidationEmail: t("translation:formError.input.register.validationEmail"),
      errorMessageLocation: t("translation:formError.input.register.location"),
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
      store: z.number().min(1, {
        message: translationMemo.errorMessageLocation
      }),
      password: z.string().min(4, {
        message: translationMemo.errorMessagePassword
      }),
      email: z
        .string()
        .min(1, { message: translationMemo.errorMessageUserEmail })
        .email(translationMemo.errorMessageValidationEmail),
      confirmPassword: z.string().min(4, {
        message: translationMemo.errorMessageConfirmationPassword
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: translationMemo.errorMessageValidationConfirmationPassword,
      path: ["confirmPassword"]
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: "",
      email: "",
      store: null,
      confirmPassword: ""
    }
  });

  // useEffect
  useEffect(() => {
    if (value) {
      console.log("VALUE =>", value);

      form.setValue("store", value);
    }
  }, [value]);

  // QUERY
  const mutateRegister = useMutation(register, {
    onMutate: () => setActive(true, null),
    onSuccess: () => {
      setActive(false, "success");
      setTimeout(() => {
        toast.success("Success", {
          description: "Register User successfully"
        });
      }, 1000);
      setTimeout(() => {
        navigate("/");
        setActive(null, null);
      }, 2000);
    },
    onError: (err) => {
      setActive(false, "error");
      setTimeout(() => {
        toast.error("Failed Register", {
          description: err.message
        });
      }, 1500);
      setTimeout(() => {
        setActive(null, null);
      }, 2000);
    }
  });

  const onSubmit = (values) => {
    console.log(values);

    mutateRegister.mutate({ ...values, userType: "user" });
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="w-full flex flex-col sm:items-center sm:justify-center rounded p-4 md:p-[61px] min-h-screen overflow-x-auto"
        defaultSize={55}
        maxSize={55}
        minSize={55}
        style={{ overflow: "scroll" }}>
        {/* Logo and Language Selector */}
        <div className="flex items-center justify-between w-full max-w-md md:mb-6">
          <img src={Logo} className="w-1/3 md:w-1/4" alt="logo" />
          <Select
            onValueChange={(e) => updateTranslation(e)}
            value={localStorage.getItem("translation")}>
            <SelectTrigger className="w-fit border-hidden bg-[#6853F0] hover:bg-[#1ACB0A] duration-200 flex items-center gap-2 text-white ring-0 focus:ring-0">
              {TRANSLATION?.filter((items) => items.value === translation)?.map((items, index) => (
                <img src={items.img} alt={items.name} className="max-w-6 max-h-6" key={index} />
              ))}
            </SelectTrigger>
            <SelectContent className="min-w-2 z-50">
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

        {/* Form Section */}
        <div className="flex xl:my-auto xl:m-auto flex-col w-full xl:w-3/5 gap-6 md:gap-11 max-w-md justify-center flex-1">
          <p className="text-[#636363] text-lg md:text-2xl xl:text-[32px] font-semibold leading-tight text-center md:text-left">
            {translationMemo.title}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-2 w-full">
              {/* Username Field */}
              <div className="col-span-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 md:mb-4">
                        <FormLabel className="text-sm md:text-base">
                          {translationMemo.userName}
                        </FormLabel>
                      </div>
                      <Input
                        type="text"
                        {...field}
                        placeholder={translationMemo.placeholderInputUser}
                        className="w-full"
                      />
                      {form.formState.errors.userName && (
                        <FormMessage>{form.formState.errors.userName}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Location (Store) Selector */}
              <div className="col-span-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="store"
                  render={() => (
                    <FormItem>
                      <div className="mb-2 md:mb-4">
                        <FormLabel className="text-sm md:text-base">
                          {translationMemo.location}
                        </FormLabel>
                      </div>
                      <div>
                        <Popover open={open} onOpenChange={setOpen} className="relative">
                          <PopoverTrigger asChild>
                            <Button
                              disabled={allLocation.isLoading}
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className={`w-full justify-between ${!selectedLocation ? "text-muted-foreground font-normal" : ""}`}>
                              {selectedLocation
                                ? selectedLocation.nameStore
                                : translationMemo.placeholderInputLocation}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="popover-content-width-full p-0">
                            <Command>
                              <CommandInput placeholder="Search location..." />
                              <CommandList>
                                <CommandEmpty>No location found.</CommandEmpty>
                                <CommandGroup>
                                  {allLocation?.data?.data?.map((location) => (
                                    <CommandItem
                                      key={location.id}
                                      value={location.id}
                                      onSelect={() => {
                                        setValue(value === location.id ? null : location.id);
                                        setOpen(false);
                                      }}>
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          value === location.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {location.nameStore}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {form.formState.errors.location && (
                        <FormMessage>{form.formState.errors.location}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Field */}
              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-sm md:text-base">
                          {translationMemo.email}
                        </FormLabel>
                      </div>
                      <Input
                        type="email"
                        {...field}
                        placeholder={translationMemo.placeholderInputEmail}
                        className="w-full"
                      />
                      {form.formState.errors.email && (
                        <FormMessage>{form.formState.errors.email}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Field */}
              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-sm md:text-base">
                          {translationMemo.password}
                        </FormLabel>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          placeholder={translationMemo.placeholderInputPassword}
                          className="w-full"
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

              {/* Confirm Password Field */}
              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-sm md:text-base">
                          {translationMemo.confirmationPassword}
                        </FormLabel>
                      </div>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          placeholder={translationMemo.placeholderInputConfirmationPassword}
                          className="w-full"
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

              {/* Submit Button */}
              <div className="col-span-2 mt-8">
                <Button
                  type="submit"
                  className="py-2 px-4 w-full bg-[#6853F0] rounded-full text-white font-bold text-lg hover:bg-[#1ACB0A] duration-200">
                  {translationMemo.title}
                </Button>
              </div>
            </form>
          </Form>

          {/* Register Link */}
          <p className="text-[#CECECE] font-semibold text-base md:text-lg text-center">
            {translationMemo.descRegister}{" "}
            <Button
              className="font-semibold text-base md:text-lg text-[#6853F0] hover:text-[#1ACB0A] duration-200 w-fit bg-transparent hover:bg-transparent p-0"
              onClick={() => navigate("/")}>
              {translationMemo.login}
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

export default Register;
