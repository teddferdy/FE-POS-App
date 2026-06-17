import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Moon, Sun, Mail, Lock, ArrowLeft, ShieldCheck, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "sonner";

import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import PolicyDialog from "@/components/organism/policy-dialog";

import { resetPassword } from "@/services/auth";
import { translationSelect } from "@/state/translation";
import AuthGuideModal from "@/components/organism/AuthGuideModal";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(
    location.state?.openGuide && location.state?.guideContext === "reset-password"
  );
  const { translation, updateTranslation } = translationSelect();

  useEffect(() => {
    if (location.state?.openGuide) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const translationMemo = useMemo(
    () => ({
      resetPassword: t("translation:resetPassword"),
      resetPasswordDesc: t("translation:resetPasswordDesc"),
      email: t("translation:email"),
      newPassword: t("translation:newPassword"),
      confirmationNewPassword: t("translation:confirmationNewPassword"),
      btnResetPassword: t("translation:btnResetPassword"),
      backToLogin: t("translation:backToLogin"),
      secureSSL: t("translation:secureSSL"),
      secureSSLDesc: t("translation:secureSSLDesc"),
      faReady: t("translation:faReady"),
      faReadyDesc: t("translation:faReadyDesc"),
      help: t("translation:help"),
      privacyPolicy: t("translation:privacyPolicy"),
      termsConditions: t("translation:termsConditions")
    }),
    [t]
  );

  const formSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().min(1, { message: t("page.resetPassword.validation.emailRequired") }).email({
            message: t("page.resetPassword.validation.emailInvalid")
          }),
          newPassword: z.string().min(6, {
            message: t("page.resetPassword.validation.passwordMin")
          }),
          confirmPassword: z.string().min(1, {
            message: t("page.resetPassword.validation.confirmRequired")
          })
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t("page.resetPassword.validation.passwordMismatch"),
          path: ["confirmPassword"]
        }),
    [t]
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const mutateReset = useMutation(resetPassword, {
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      setIsLoading(false);
      toast.success(t("page.resetPassword.toast.success"), {
        description: t("page.resetPassword.toast.successDescription")
      });
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (err) => {
      setIsLoading(false);
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(t("page.resetPassword.toast.error"), {
        description: message
      });
    }
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* Top Nav */}
        <nav className="bg-card border-b border-border fixed top-0 w-full z-50 transition-colors">
          <div className="flex justify-between items-center w-full px-4 md:px-6 lg:px-lg py-2.5 max-w-7xl mx-auto">
            <span className="text-base md:text-lg font-semibold text-foreground tracking-tight">
              Kinetic Ledger
            </span>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-muted rounded-full p-0.5 border border-border">
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
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 focus:outline-none">
                <Sun className="w-4 h-4 md:w-5 md:h-5 hidden dark:block" />
                <Moon className="w-4 h-4 md:w-5 md:h-5 block dark:hidden" />
              </button>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="hidden sm:inline-flex text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                {translationMemo.help}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-4 md:px-6 pt-20 pb-8 md:pt-24 md:pb-12">
          <div className="w-full max-w-[480px]">
            {/* Hero Card */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-5 md:p-6 lg:p-xl flex flex-col items-center text-center transition-colors">
              {/* Lock Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mb-4 md:mb-lg">
                <Lock className="w-7 h-7 md:w-8 md:h-8 text-foreground" />
              </div>

              <h1 className="text-xl md:text-[28px] font-semibold text-foreground mb-1.5 md:mb-sm">
                {translationMemo.resetPassword}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground/80 font-light mb-6 md:mb-xl max-w-[360px]">
                {translationMemo.resetPasswordDesc}
              </p>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => mutateReset.mutate(values))}
                  className="w-full space-y-4 md:space-y-5 text-left">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem data-tour="auth-email">
                        <FormLabel className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                          {translationMemo.email}
                        </FormLabel>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors pointer-events-none" />
                          <Input
                            {...field}
                            placeholder="nama@perusahaan.com"
                            className="w-full pl-10 md:pl-12 pr-3.5 md:pr-4 h-auto py-3 md:py-4 text-sm md:text-base rounded-xl border-border/60 bg-background focus:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                          />
                        </div>
                        {form?.formState?.errors?.email && (
                          <FormMessage>{form?.formState?.errors?.email}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem data-tour="auth-password">
                        <FormLabel className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                          {translationMemo.newPassword}
                        </FormLabel>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors pointer-events-none" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            {...field}
                            placeholder="••••••••"
                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 h-auto py-3 md:py-4 text-sm md:text-base rounded-xl border-border/60 bg-background focus:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <Eye className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                          </button>
                        </div>
                        {form?.formState?.errors?.newPassword && (
                          <FormMessage>{form?.formState?.errors?.newPassword}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] md:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                          {translationMemo.confirmationNewPassword}
                        </FormLabel>
                        <div className="relative group">
                          <Shield className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground/60 group-focus-within:text-foreground transition-colors pointer-events-none" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            placeholder="••••••••"
                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 h-auto py-3 md:py-4 text-sm md:text-base rounded-xl border-border/60 bg-background focus:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                            ) : (
                              <Eye className="w-4 h-4 md:w-5 md:h-5" />
                            )}
                          </button>
                        </div>
                        {form?.formState?.errors?.confirmPassword && (
                          <FormMessage>{form?.formState?.errors?.confirmPassword}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    data-tour="auth-submit"
                    className="w-full bg-foreground text-background hover:bg-foreground/90 py-3.5 md:py-4 px-lg rounded-xl font-semibold text-sm md:text-base shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    {translationMemo.btnResetPassword}
                  </Button>
                </form>
              </Form>

              {/* Back to Login */}
              <div className="mt-6 md:mt-xl">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground hover:text-foreground/80 font-medium transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  {translationMemo.backToLogin}
                </button>
              </div>
            </div>

            {/* Contextual Cards */}
            <div className="mt-4 md:mt-xl grid grid-cols-2 gap-3 md:gap-md">
              <div className="p-3 md:p-md rounded-xl border border-border bg-muted/50 flex items-center gap-2 md:gap-md">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs md:text-sm font-medium text-foreground truncate">
                    {translationMemo.secureSSL}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground leading-none">
                    {translationMemo.secureSSLDesc}
                  </span>
                </div>
              </div>
              <div className="p-3 md:p-md rounded-xl border border-border bg-muted/50 flex items-center gap-2 md:gap-md">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs md:text-sm font-medium text-foreground truncate">
                    {translationMemo.faReady}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground leading-none">
                    {translationMemo.faReadyDesc}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border mt-auto transition-colors">
          <div className="w-full py-4 md:py-xl px-4 md:px-6 lg:px-lg flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-3 md:gap-md">
            <span className="text-xs md:text-sm text-muted-foreground">
              &copy; 2024 Kinetic Ledger. All rights reserved.
            </span>
            <div className="flex gap-4 md:gap-lg">
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translationMemo.privacyPolicy}
              </button>
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translationMemo.termsConditions}
              </button>
            </div>
          </div>
        </footer>
      </div>

      <PolicyDialog type="privacy" open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <PolicyDialog type="terms" open={termsOpen} onOpenChange={setTermsOpen} />
      <AuthGuideModal open={guideOpen} onOpenChange={setGuideOpen} context="reset-password" />
      {isLoading && <Loading fullscreen size="lg" label="Memuat data..." />}
    </motion.div>
  );
};

export default ResetPasswordPage;
