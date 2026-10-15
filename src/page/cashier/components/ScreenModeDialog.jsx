import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Monitor, MonitorSmartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const P = "page.cashier.screenMode";

// Asked when a store is picked on the cashier page: one screen opens only
// the cashier (/home); two screens also open that store's customer display
// board in a new tab, for the second monitor.
const ScreenModeDialog = ({ store, onClose, onChoose }) => {
  const { t } = useTranslation();
  const options = [
    { mode: "single", Icon: Monitor },
    { mode: "dual", Icon: MonitorSmartphone }
  ];

  return (
    <Dialog open={!!store} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(`${P}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${P}.description`, { store: store?.name || "" })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map(({ mode, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChoose(mode)}
              className="flex flex-col items-start gap-2 rounded-xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon size={20} className="text-primary" aria-hidden="true" />
              </span>
              <span className="font-semibold text-foreground">{t(`${P}.${mode}`)}</span>
              <span className="text-xs text-muted-foreground">{t(`${P}.${mode}Desc`)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

ScreenModeDialog.propTypes = {
  store: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onChoose: PropTypes.func.isRequired
};

export default ScreenModeDialog;
