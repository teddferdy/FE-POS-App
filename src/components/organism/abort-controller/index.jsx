import React from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const AbortController = ({ refetch }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-[470px] flex-col rounded-lg">
      <div className="flex flex-col flex-1 items-center justify-center rounded-lg gap-5 px-6">
        <div>
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle size={40} className="text-destructive" />
          </div>
        </div>
        <div className="text-center max-w-md space-y-2">
          <p className="text-destructive font-bold text-lg md:text-xl">
            {t("error.internalServerError")}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("error.tryAgainDesc")}</p>
        </div>
        <Button
          onClick={refetch}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
          <RefreshCw size={18} />
          {t("common.tryAgain")}
        </Button>
      </div>
    </div>
  );
};

AbortController.propTypes = {
  refetch: PropTypes.func.isRequired
};

export default AbortController;
