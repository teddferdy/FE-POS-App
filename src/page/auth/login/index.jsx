/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Moon, Sun, Mail, Lock, ArrowRight, HelpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";

import { login } from "@/services/auth";
import { translationSelect } from "@/state/translation";
import AuthGuideModal from "@/components/organism/AuthGuideModal";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [_, setCookie] = useCookies();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [guideOpen, setGuideOpen] = useState(
    location.state?.openGuide && location.state?.guideContext === "login"
  );
  const { translation, updateTranslation } = translationSelect();

  useEffect(() => {
    if (location.state?.openGuide) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const translationMemo = useMemo(
    () => ({
      title: t("translation:login"),
      userName: t("translation:userNameOrEmail"),
      password: t("translation:password"),
      btnLogin: t("translation:btnLogin"),
      descAuth: t("translation:descAuth"),
      placeholderInputUser: t("translation:placeholder.input.login.username"),
      placeholderInputPassword: t("translation:placeholder.input.login.password"),
      errorMessageUserName: t("translation:formError.input.login.username"),
      errorMessagePassword: t("translation:formError.input.login.password"),
      rememberMe: t("translation:rememberMe"),
      forgotPassword: t("translation:forgotPassword"),
      noAccount: t("translation:noAccount"),
      registerNow: t("translation:registerNow"),
      help: t("translation:help")
    }),
    [t]
  );

  const formSchema = useMemo(() => {
    return z.object({
      userName: z.string().min(1, {
        message: translationMemo.errorMessageUserName
      }),
      password: z.string().min(1, {
        message: translationMemo.errorMessagePassword
      })
    });
  }, [translationMemo]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      password: ""
    }
  });

  const mutateLogin = useMutation(login, {
    onMutate: () => setIsLoading(true),
    onSuccess: (success) => {
      setCookie("token", success.token);
      const user = { ...success.user };
      if (typeof user.accessMenu === "string") {
        try {
          user.accessMenu = JSON.parse(user.accessMenu);
        } catch (e) {
          user.accessMenu = [];
        }
      }
      try {
        sessionStorage.setItem("user", JSON.stringify(user));
      } catch (e) {}
      setCookie("user", user);
      setIsLoading(false);
      setTimeout(() => {
        toast.success(t("page.login.toast.success"), {
          description: t("page.login.toast.successDescription")
        });
      }, 1000);
      setTimeout(() => {
        const role = success.user?.roleType;
        if (role === "super_admin") navigate("/dashboard-super-admin");
        else if (role === "admin") navigate("/dashboard-admin");
        else navigate("/home");
        setIsLoading(false);
      }, 2000);
    },
    onError: (err) => {
      setIsLoading(false);
      const message = err.response?.data?.message || err.message;
      setTimeout(() => {
        toast.error(t("page.login.toast.error"), {
          description: message
        });
      }, 1500);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  });

  return (
    <div>
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1) translateX(0); }
          50% { transform: scale(1.08) translateX(-8px); }
          100% { transform: scale(1) translateX(0); }
        }
      `}</style>
      <main className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Top Controls */}
        <header className="absolute top-0 right-0 left-0 z-50 flex items-center justify-end px-4 py-4 md:px-6 md:py-5 lg:px-lg">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/70 dark:bg-foreground/10 backdrop-blur-md rounded-full p-0.5 border border-border/30 shadow-sm">
              <button
                type="button"
                onClick={() => updateTranslation("id")}
                className={`px-2.5 py-1 md:px-3 md:py-1 text-[10px] md:text-[11px] font-bold tracking-widest rounded-full transition-all duration-200 focus:outline-none ${
                  translation === "id"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                ID
              </button>
              <button
                type="button"
                onClick={() => updateTranslation("en")}
                className={`px-2.5 py-1 md:px-3 md:py-1 text-[10px] md:text-[11px] font-bold tracking-widest rounded-full transition-all duration-200 focus:outline-none ${
                  translation === "en"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                EN
              </button>
            </div>
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => document.documentElement.classList.toggle("dark")}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/70 dark:bg-foreground/10 backdrop-blur-md text-muted-foreground hover:text-foreground rounded-full border border-border/30 shadow-sm transition-all duration-200 focus:outline-none">
              <Sun className="w-4 h-4 md:w-5 md:h-5 hidden dark:block" />
              <Moon className="w-4 h-4 md:w-5 md:h-5 block dark:hidden" />
            </button>
          </div>
        </header>

        {/* Left Side: Brand Visual */}
        <section className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 overflow-hidden bg-foreground">
          <div className="absolute inset-0">
            <img
              alt=""
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80"
              style={{ animation: "kenBurns 25s ease-in-out infinite alternate" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/20" />
          </div>
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white px-lg">
            <div className="max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-6">
                <span className="text-3xl font-light tracking-tight">KL</span>
              </div>
              <span className="block text-4xl xl:text-5xl leading-tight font-light mb-4 tracking-tight">
                Kinetic Ledger
              </span>
              <div className="w-12 h-0.5 bg-white/30 mx-auto mb-6" />
              <h2 className="text-lg xl:text-xl leading-relaxed mb-4 font-light text-white/80">
                Elevate your retail experience with precision technology.
              </h2>
              <p className="text-sm xl:text-base text-white/50 font-light leading-relaxed max-w-sm mx-auto">
                Intelligence seamlessly integrated into every transaction, crafted for the modern
                visionary brand.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center px-5 py-24 md:px-10 md:py-28 lg:px-xl bg-background relative min-h-svh">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-8 md:mb-10 text-center">
              <span className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                Kinetic Ledger
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl md:text-[28px] font-semibold text-foreground mb-1.5">
                {translationMemo.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground/80 font-light">
                {translationMemo.descAuth}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutateLogin.mutate(values))}
                className="space-y-4 md:space-y-5">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem data-tour="auth-username">
                      <FormLabel className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                        {translationMemo.userName}
                      </FormLabel>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors pointer-events-none" />
                        <Input
                          {...field}
                          placeholder={translationMemo.placeholderInputUser}
                          className="w-full pl-10 md:pl-12 pr-3.5 md:pr-4 h-auto py-3 md:py-4 text-sm md:text-base rounded-xl border-border/60 bg-card focus:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                        />
                      </div>
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
                    <FormItem data-tour="auth-password">
                      <FormLabel className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                        {translationMemo.password}
                      </FormLabel>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors pointer-events-none" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          placeholder={translationMemo.placeholderInputPassword}
                          className="w-full pl-10 md:pl-12 pr-10 md:pr-12 h-auto py-3 md:py-4 text-sm md:text-base rounded-xl border-border/60 bg-card focus:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </button>
                      </div>
                      {form?.formState?.errors?.password && (
                        <FormMessage>{form?.formState?.errors?.password}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <div
                  data-tour="auth-options"
                  className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-xs md:text-sm text-muted-foreground cursor-pointer font-normal">
                      {translationMemo.rememberMe}
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-[11px] md:text-xs text-foreground hover:text-foreground/80 font-medium transition-all">
                    {translationMemo.forgotPassword}
                  </button>
                </div>

                <Button
                  type="submit"
                  data-tour="auth-submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 py-3.5 md:py-4 px-lg rounded-xl font-semibold text-sm md:text-base shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3">
                  <span>{translationMemo.btnLogin}</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </form>
            </Form>

            <div className="pt-6 md:pt-8 text-center">
              <p className="text-xs md:text-sm text-muted-foreground/70">
                {translationMemo.noAccount}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-foreground font-semibold hover:underline ml-1">
                  {translationMemo.registerNow}
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Support */}
      <div className="fixed bottom-4 md:bottom-lg right-4 md:right-lg z-50">
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-1.5 md:gap-sm px-3.5 py-2.5 md:px-5 md:py-3 bg-white/80 dark:bg-foreground/10 backdrop-blur-md rounded-full shadow-lg border border-border/20 text-muted-foreground hover:text-foreground transition-all group">
          <HelpCircle className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] md:text-xs font-medium tracking-wide">
            {translationMemo.help}
          </span>
        </button>
      </div>
      <AuthGuideModal open={guideOpen} onOpenChange={setGuideOpen} context="login" />

      {isLoading && <Loading fullscreen size="lg" label="Memuat data..." />}
    </div>
  );
};

export default LoginPage;
