import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRegisterRequiredStore } from "@/state/registerRequired";

export const OPEN_REGISTER_PATH = "/cash-register/open-close";

// App-wide: the backend refused a sale/settlement because no cash register
// is open for the store (422 REGISTER_REQUIRED). OK takes the cashier to
// the open/close register page.
const RegisterRequiredDialog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = useRegisterRequiredStore((s) => s.open);
  const hide = useRegisterRequiredStore((s) => s.hide);

  const goOpenRegister = () => {
    hide();
    navigate(OPEN_REGISTER_PATH);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && hide()}>
      <DialogContent className="max-w-sm" withX={false}>
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
            <Wallet size={22} />
          </div>
          <DialogTitle className="text-lg font-bold">{t("registerRequired.title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("registerRequired.description")}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={hide}>
            {t("registerRequired.later")}
          </Button>
          <Button className="flex-1" autoFocus onClick={goOpenRegister}>
            {t("registerRequired.ok")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterRequiredDialog;
