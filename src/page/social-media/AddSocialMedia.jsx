import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { addInvoiceSocialMedia } from "@/services/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import PageHeader from "@/components/ui/PageHeader";

const AddSocialMedia = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies();
  const store = cookie?.store;

  const [platformName, setPlatformName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const addMutation = useMutation(addInvoiceSocialMedia, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!platformName.trim()) {
      toast.error(t("common.error"), {
        description: t("page.socialMedia.validation.platformNameRequired")
      });
      return;
    }
    if (!url.trim()) {
      toast.error(t("common.error"), { description: t("page.socialMedia.validation.urlRequired") });
      return;
    }
    setIsSubmitting(true);
    addMutation.mutate({
      store,
      platformName: platformName.trim(),
      url: url.trim(),
      icon: icon.trim(),
      isActive
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.home"), href: "/dashboard" },
          { label: t("page.socialMedia.list.title"), href: "/social-media-invoice-list" },
          { label: t("page.socialMedia.add.title") }
        ]}
        title={t("page.socialMedia.add.title")}
        description={t("page.socialMedia.add.description")}>
        <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {t("page.socialMedia.button.backToList")}
        </Button>
      </PageHeader>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-card rounded-xl border border-border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t("page.socialMedia.form.store")}
                </label>
                <Input value={store || ""} disabled className="bg-muted/50" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t("page.socialMedia.form.platformName")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder={t("page.socialMedia.form.platformNamePlaceholder")}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t("page.socialMedia.form.url")} <span className="text-destructive">*</span>
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t("page.socialMedia.form.urlPlaceholder")}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t("page.socialMedia.form.icon")}
                </label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder={t("page.socialMedia.form.iconPlaceholder")}
                />
                {icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t("page.socialMedia.form.preview")}</span>
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t("page.socialMedia.form.active")}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${isActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {isActive ? t("common.active") : t("common.inactive")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.socialMedia.add.successTitle")}
        onConfirm={() => navigate("/social-media-invoice-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("modal.discardTitle")}
        confirmText={t("modal.discardConfirm")}
        onConfirm={() => navigate("/social-media-invoice-list")}
      />
    </div>
  );
};

export default AddSocialMedia;
