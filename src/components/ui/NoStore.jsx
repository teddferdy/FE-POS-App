import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NoStore = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="p-12 w-full">
      <div className="flex flex-col items-center justify-between text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Store size={32} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{t("page.noStore.title")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.noStore.description")}
          </p>
        </div>
        <Button onClick={() => navigate("/add-location")}>{t("page.noStore.action")}</Button>
      </div>
    </Card>
  );
};

export default NoStore;
