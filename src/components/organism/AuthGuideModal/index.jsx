/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  User,
  MapPin,
  Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SpotlightOverlay = ({ target, stepIndex }) => {
  const [rect, setRect] = useState(null);

  const update = useCallback(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        });
      }
    }
  }, [target]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  if (!rect) return null;

  const P = 12;

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] pointer-events-none">
      <div
        className="absolute left-0 right-0 bg-black/50 pointer-events-none"
        style={{ top: 0, height: Math.max(0, rect.top - P) }}
      />
      <div
        className="absolute left-0 right-0 bg-black/50 pointer-events-none"
        style={{ top: rect.top + rect.height + P, bottom: 0 }}
      />
      <div
        className="absolute bg-black/50 pointer-events-none"
        style={{
          top: rect.top - P,
          left: 0,
          width: Math.max(0, rect.left - P),
          height: rect.height + P * 2
        }}
      />
      <div
        className="absolute bg-black/50 pointer-events-none"
        style={{
          top: rect.top - P,
          right: 0,
          width: `calc(100% - ${rect.left + rect.width + P}px)`,
          height: rect.height + P * 2
        }}
      />
      <div
        className="absolute rounded-lg pointer-events-none"
        style={{
          top: rect.top - P - 1,
          left: rect.left - P - 1,
          width: rect.width + P * 2 + 2,
          height: rect.height + P * 2 + 2,
          boxShadow: "0 0 0 2px hsl(var(--primary)), 0 0 20px hsla(var(--primary), 0.4)"
        }}
      />
    </motion.div>
  );
};

const iconMap = {
  login: LogIn,
  register: UserPlus,
  "reset-password": KeyRound,
  username: User,
  email: Mail,
  location: MapPin,
  password: Lock,
  submit: ChevronRight,
  options: Shield,
  complete: CheckCircle2,
  help: HelpCircle
};

const authSteps = {
  login: [
    { id: "s1", icon: "login", target: null },
    { id: "s2", icon: "username", target: '[data-tour="auth-username"]' },
    { id: "s3", icon: "password", target: '[data-tour="auth-password"]' },
    { id: "s4", icon: "options", target: '[data-tour="auth-options"]' },
    { id: "s5", icon: "submit", target: '[data-tour="auth-submit"]' },
    { id: "s6", icon: "help", target: null }
  ],
  register: [
    { id: "s1", icon: "register", target: null },
    { id: "s2", icon: "email", target: '[data-tour="auth-username"]' },
    { id: "s3", icon: "location", target: '[data-tour="auth-location"]' },
    { id: "s4", icon: "password", target: '[data-tour="auth-password"]' },
    { id: "s5", icon: "submit", target: '[data-tour="auth-submit"]' },
    { id: "s6", icon: "help", target: null }
  ],
  "reset-password": [
    { id: "s1", icon: "reset-password", target: null },
    { id: "s2", icon: "email", target: '[data-tour="auth-email"]' },
    { id: "s3", icon: "password", target: '[data-tour="auth-password"]' },
    { id: "s4", icon: "submit", target: '[data-tour="auth-submit"]' },
    { id: "s5", icon: "help", target: null }
  ]
};

const navActions = {
  login: [
    { key: "guide.auth.nav.register", to: "/register" },
    { key: "guide.auth.nav.forgot", to: "/reset-password" }
  ],
  register: [{ key: "guide.auth.nav.login", to: "/" }],
  "reset-password": [{ key: "guide.auth.nav.login", to: "/" }]
};

const AuthGuideModal = ({ open, onOpenChange, context = "login" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const steps = authSteps[context] || authSteps.login;
  const actions = navActions[context] || navActions.login;
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const step = steps[currentStep];
  const Icon = iconMap[step?.icon] || HelpCircle;

  useEffect(() => {
    setCurrentStep(0);
  }, [open, context]);

  const handlePrev = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const pathToContext = {
    "/": "login",
    "/register": "register",
    "/reset-password": "reset-password"
  };

  const handleNavigate = (path) => {
    const targetContext = pathToContext[path] || "login";
    handleClose();
    setTimeout(() => {
      navigate(path, { state: { openGuide: true, guideContext: targetContext } });
    }, 300);
  };

  return (
    <>
      <AnimatePresence>
        {open && step?.target && (
          <SpotlightOverlay
            key={`spotlight-${currentStep}`}
            target={step.target}
            stepIndex={currentStep}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="auth-guide-backdrop"
              className="fixed inset-0 z-[50] bg-black/50"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              key="auth-guide-card"
              initial={{ opacity: 0, x: 30, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-3 sm:right-5 z-[70] w-auto sm:w-[380px] max-w-[380px]">
              <Card className="shadow-2xl border border-primary/20 overflow-hidden bg-background">
                <div className="h-1 bg-muted">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>

                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <span className="text-xs font-medium text-muted-foreground tracking-wide">
                    {t("translation:guide.auth.step", {
                      current: currentStep + 1,
                      total: totalSteps
                    })}
                  </span>
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={t("translation:guide.auth.close")}>
                    <X size={16} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight mb-1.5 text-foreground">
                          {t(`translation:guide.auth.${context}.${step.id}`)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(`translation:guide.auth.${context}.${step.id}desc`)}
                        </p>
                      </div>
                    </div>

                    {isLast && actions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {actions.map((action) => (
                          <button
                            key={action.to}
                            onClick={() => handleNavigate(action.to)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted hover:border-primary/50 transition-all text-sm font-medium text-foreground group">
                            <span>{t(`translation:${action.key}`)}</span>
                            <ChevronRight
                              size={16}
                              className="text-muted-foreground group-hover:text-primary transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between px-5 pb-4 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    onClick={handlePrev}
                    className="gap-1 text-xs">
                    <ChevronLeft size={14} />
                    {t("translation:guide.auth.prev")}
                  </Button>

                  {isLast ? (
                    <Button size="sm" onClick={handleClose} className="gap-1 text-xs">
                      {t("translation:guide.auth.close")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleNext} className="gap-1 text-xs">
                      {t("translation:guide.auth.next")}
                      <ChevronRight size={14} />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthGuideModal;
