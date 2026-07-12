import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Star, Award, Medal, Diamond, Plus, CheckCircle, Delete, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/components/ui/loading";
import { z } from "zod";
import { getDetailMemberTier, editMemberTier } from "@/services/member-tier";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";

const icons = [
  { name: "star", component: Star, fill: true },
  { name: "workspace_premium", component: Award, fill: false },
  { name: "military_tech", component: Medal, fill: false },
  { name: "diamond", component: Diamond, fill: false },
  { name: "plus", component: Plus, fill: false }
];

const colors = [
  { name: "amber", value: "#f59e0b", tailwind: "bg-amber-400" },
  { name: "slate", value: "#64748b", tailwind: "bg-slate-400" },
  { name: "indigo", value: "#6366f1", tailwind: "bg-indigo-500" },
  { name: "emerald", value: "#10b981", tailwind: "bg-emerald-500" },
  { name: "rose", value: "#f43f5e", tailwind: "bg-rose-500" }
];

const tierSchema = z.object({
  tierName: z.string().min(1),
  minPoints: z.string(),
  maxPoints: z.string(),
  discountPercent: z.string(),
  isActive: z.boolean(),
  selectedIcon: z.string(),
  selectedColor: z.string(),
  perks: z.array(z.object({ id: z.number(), text: z.string() }))
});

const EditMemberTier = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    tierName: "",
    minPoints: "",
    maxPoints: "",
    discountPercent: "",
    isActive: true,
    selectedIcon: "star",
    selectedColor: "#f59e0b",
    perks: [{ id: 1, text: "" }]
  });

  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const {
    data: tierData,
    isLoading,
    isError
  } = useQuery(["member-tier", id], () => getDetailMemberTier(id), { enabled: !!id });

  useEffect(() => {
    if (!tierData?.data) return;
    const tier = tierData.data;
    setFormData({
      tierName: tier.name || "",
      minPoints: tier.minPoints != null ? String(tier.minPoints).replace(/[^\d]/g, "") : "",
      maxPoints: tier.maxPoints != null ? String(tier.maxPoints).replace(/[^\d]/g, "") : "",
      discountPercent:
        tier.discountPercent != null ? String(tier.discountPercent).replace(/[^\d]/g, "") : "",
      isActive: tier.status === "active" || tier.status === "true",
      selectedIcon: "star",
      selectedColor: tier.color || "#f59e0b",
      perks: (typeof tier.benefits === "string" ? tier.benefits.split("\n").filter(Boolean) : tier.benefits || []).map((text, i) => ({ id: i + 1, text }))
    });
  }, [tierData]);

  const formatIDR = (value) => {
    if (!value) return "";
    const num = Number(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const editMutation = useMutation(editMemberTier, {
    onSuccess: () => {
      toast.success(t("page.memberTier.edit.toastSuccess"), {
        description: t("page.memberTier.edit.toastSuccessDesc")
      });
      queryClient.invalidateQueries(["member-tiers"]);
      navigate("/member-tier");
    },
    onError: (err) =>
      toast.error(t("page.memberTier.edit.toastError"), {
        description: err?.response?.data?.message || err.message
      })
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerkChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.map((perk) => (perk.id === id ? { ...perk, text: value } : perk))
    }));
  };

  const addPerk = () => {
    const newId = Math.max(...formData.perks.map((p) => p.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      perks: [...prev.perks, { id: newId, text: "" }]
    }));
  };

  const removePerk = (id) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.filter((perk) => perk.id !== id)
    }));
  };

  const handleSave = (saveAsDraft = false) => {
    if (!saveAsDraft) {
      const result = tierSchema.safeParse(formData);
      if (!result.success) {
        toast.error(t("page.memberTier.edit.toastError"), {
          description: t("page.memberTier.edit.basicInfoDesc")
        });
        return;
      }
    }
    editMutation.mutate({
      id: Number(id),
      name: formData.tierName,
      minPoints: formData.minPoints === "" ? 0 : Number(formData.minPoints),
      maxPoints: formData.maxPoints === "" ? 0 : Number(formData.maxPoints),
      discountPercent: formData.discountPercent === "" ? 0 : Number(formData.discountPercent),
      benefits: formData.perks.map((p) => p.text).filter((t) => t.trim() !== "").join("\n"),
      status: saveAsDraft ? "draft" : formData.isActive ? "active" : "inactive",
      color: formData.selectedColor
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );

  if (isError) return <div className="text-center py-12 text-destructive">{t("common.error")}</div>;

  const IconComponent = icons.find((i) => i.name === formData.selectedIcon)?.component || Star;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { i18nKey: "breadcrumb.home" },
              { i18nKey: "breadcrumb.management" },
              { i18nKey: "page.memberTier.list.title", href: "/member-tier" },
              { i18nKey: "page.memberTier.edit.title" }
            ]}
            title={t("page.memberTier.edit.title")}
            description={t("page.memberTier.edit.description", {
              tierName: formData.tierName || "Tier"
            })}
            backLink="/member-tier"></PageHeader>
        </div>
      </div>
      <div>
        <div>
          <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <span className="material-symbols-outlined">info</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.memberTier.edit.basicInfo")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.tierName")}{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tierName}
                        onChange={(e) => handleInputChange("tierName", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50"
                        placeholder={t("page.memberTier.edit.tierNamePlaceholder")}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.minPoints")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.minPoints ? formatIDR(formData.minPoints) : ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            handleInputChange("minPoints", value);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50 pr-12"
                          placeholder={t("page.memberTier.edit.minPointsPlaceholder")}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.maxPoints")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.maxPoints ? formatIDR(formData.maxPoints) : ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            handleInputChange("maxPoints", value);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50 pr-12"
                          placeholder={t("page.memberTier.edit.maxPointsPlaceholder")}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("page.memberTier.edit.maxPointsHint", {
                          min: formData.minPoints ? Number(formData.minPoints) : 0,
                          max: 0
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.discountPercent")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.discountPercent}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value === "") {
                              handleInputChange("discountPercent", "");
                            } else {
                              const num = parseInt(value, 10);
                              if (num > 100) {
                                value = "100";
                              }
                              handleInputChange("discountPercent", value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50 pr-12"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <span className="material-symbols-outlined">palette</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.memberTier.edit.visualIdentity")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.selectIcon")}
                      </label>
                      <div className="flex gap-2">
                        {icons.map((icon) => {
                          const Icon = icon.component;
                          const isSelected = formData.selectedIcon === icon.name;
                          return (
                            <button
                              key={icon.name}
                              onClick={() => handleInputChange("selectedIcon", icon.name)}
                              className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 ${
                                isSelected
                                  ? "bg-primary/10 border-2 border-primary text-primary"
                                  : "bg-background border border-border text-muted-foreground hover:bg-accent"
                              }`}>
                              <Icon size={22} style={icon.fill ? { fill: "currentColor" } : {}} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("page.memberTier.edit.badgeColor")}
                      </label>
                      <div className="flex gap-2">
                        {colors.map((color) => {
                          const isSelected = formData.selectedColor === color.value;
                          return (
                            <button
                              key={color.name}
                              onClick={() => handleInputChange("selectedColor", color.value)}
                              className={`w-8 h-8 rounded-full transition-all disabled:opacity-40 ${
                                color.tailwind
                              } ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "ring-1 ring-border"}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <span className="material-symbols-outlined">stars</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.memberTier.edit.benefits")}
                    </h3>
                  </div>
                  <div className="space-y-3" id="perks-list">
                    {formData.perks.map((perk) => (
                      <div key={perk.id} className="flex items-center gap-2 group">
                        <div className="flex-1 relative">
                          <CheckCircle
                            size={16}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                              perk.text.trim() ? "text-green-600" : "text-muted-foreground"
                            }`}
                          />
                          <input
                            type="text"
                            value={perk.text}
                            onChange={(e) => handlePerkChange(perk.id, e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all text-sm disabled:opacity-50"
                            placeholder={t("page.memberTier.edit.perkPlaceholder")}
                          />
                        </div>
                        <button
                          onClick={() => removePerk(perk.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0">
                          <Delete size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addPerk}
                      className="flex items-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all justify-center disabled:opacity-40 text-sm font-semibold">
                      <Plus size={18} />
                      {t("page.memberTier.edit.addBenefit")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <span className="material-symbols-outlined">toggle_on</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.memberTier.add.tierStatus")}
                    </h3>
                  </div>
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      formData.isActive
                        ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          formData.isActive
                            ? "bg-green-600 text-white"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                        <span className="material-symbols-outlined text-lg">
                          {formData.isActive ? "check" : "close"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {formData.isActive ? t("common.active") : t("common.inactive")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formData.isActive
                            ? t("page.memberTier.add.activeDesc")
                            : t("page.memberTier.add.inactiveDesc")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                    />
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                  <div className="flex items-center gap-2 mb-6 text-primary relative">
                    <span className="material-symbols-outlined">visibility</span>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("page.memberTier.edit.previewBadge")}
                    </h3>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-5 border border-border relative flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{
                        backgroundColor: formData.selectedColor,
                        boxShadow: `0 8px 16px ${formData.selectedColor}20`
                      }}>
                      <IconComponent
                        size={32}
                        className="text-white"
                        style={formData.selectedIcon === "star" ? { fill: "currentColor" } : {}}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {t("page.memberTier.edit.previewBadge")}
                      </p>
                      <h4 className="text-lg font-bold text-foreground">
                        {formData.tierName || t("page.memberTier.edit.goldMember")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("page.memberTier.edit.startFrom")}{" "}
                        {(formData.minPoints === ""
                          ? 0
                          : Number(formData.minPoints)
                        ).toLocaleString("id-ID")}{" "}
                        PTS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5 text-base">
                    info
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("page.memberTier.add.footerHint")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-8 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDraftModal(true)}
                  disabled={editMutation.isLoading}>
                  {t("page.memberTier.edit.saveDraft")}
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={editMutation.isLoading}
                  className="gap-2 shadow-lg shadow-primary/20">
                  <Save size={18} />
                  {t("page.memberTier.edit.updateTier")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.memberTier.add.cancelTitle")}
        description={t("page.memberTier.add.cancelDesc")}
        confirmText={t("page.memberTier.add.cancelConfirm")}
        onConfirm={() => navigate("/member-tier")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.memberTier.edit.draftModalTitle")}
        description={t("page.memberTier.edit.draftModalDesc")}
        confirmText={t("page.memberTier.edit.draftModalConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          handleSave(true);
        }}
      />
      {editMutation.isLoading && <Loading fullscreen size="lg" label={t("common.saving")} />}
    </div>
  );
};

export default EditMemberTier;
