/* eslint-disable react/prop-types */
import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb, Shield, Headphones, CheckCircle2 } from "lucide-react";

const authGuides = {
  login: {
    titleKey: "guide.auth.login.title",
    descKey: "guide.auth.login.desc",
    tips: [
      "guide.auth.login.tip1",
      "guide.auth.login.tip2",
      "guide.auth.login.tip3",
      "guide.auth.login.tip4",
      "guide.auth.login.tip5"
    ]
  },
  register: {
    titleKey: "guide.auth.register.title",
    descKey: "guide.auth.register.desc",
    tips: [
      "guide.auth.register.tip1",
      "guide.auth.register.tip2",
      "guide.auth.register.tip3",
      "guide.auth.register.tip4",
      "guide.auth.register.tip5"
    ]
  },
  "reset-password": {
    titleKey: "guide.auth.reset.title",
    descKey: "guide.auth.reset.desc",
    tips: [
      "guide.auth.reset.tip1",
      "guide.auth.reset.tip2",
      "guide.auth.reset.tip3",
      "guide.auth.reset.tip4"
    ]
  }
};

const AuthGuideModal = ({ open, onOpenChange, context = "login" }) => {
  const { t } = useTranslation();
  const guide = authGuides[context] || authGuides.login;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lightbulb size={20} className="text-amber-500" />
            {t(`translation:${guide.titleKey}`)}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">{t(`translation:${guide.descKey}`)}</p>

        <div className="space-y-2.5 py-1">
          {guide.tips.map((tipKey) => (
            <div key={tipKey} className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-foreground/90 leading-relaxed">
                {t(`translation:${tipKey}`)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50 flex-1">
            <Shield size={18} className="text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {t("translation:guide.auth.security")}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {t("translation:guide.auth.security.desc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50 flex-1">
            <Headphones size={18} className="text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {t("translation:guide.auth.support")}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {t("translation:guide.auth.support.desc")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthGuideModal;
