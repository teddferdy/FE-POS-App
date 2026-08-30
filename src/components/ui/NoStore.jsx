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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-muted/60 text-muted-foreground shadow-sm">
          <Store className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{t("page.noStore.title")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("page.noStore.description")}</p>
        </div>
        <Button variant="success" onClick={() => navigate("/add-location")}>
          {t("page.noStore.action")}
        </Button>
      </div>
    </Card>
  );
};

export default NoStore;
