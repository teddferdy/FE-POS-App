import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Info, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCampaign } from "@/services/promo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";

const AddPromoCampaign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rules, setRules] = useState([]);
  const [rewards, setRewards] = useState([]);

  const promoFieldLabels = {
    name: "Nama Campaign",
    type: "Tipe Campaign",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Akhir",
  };

  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);

  const schema = z.object({
    name: z.string().min(1, t("page.promo.validation.nameRequired")),
    description: z.string().optional(),
    code: z.string().optional(),
    type: z.string().min(1, t("page.promo.validation.typeRequired")),
    discountType: z.string().default("percentage"),
    discountValue: z.number().min(0).default(0),
    maxDiscount: z.number().optional().nullable(),
    minPurchase: z.number().min(0).default(0),
    startDate: z.string().min(1, t("page.promo.validation.startDateRequired")),
    endDate: z.string().min(1, t("page.promo.validation.endDateRequired")),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    applicableTo: z.string().default("all"),
    maxUsageTotal: z.number().optional().nullable(),
    maxUsagePerMember: z.number().optional().nullable(),
    priority: z.number().min(0).default(0),
    isCombinable: z.boolean().default(false),
    autoActivate: z.boolean().default(false)
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      code: "",
      type: "happy_hour",
      discountType: "percentage",
      discountValue: 0,
      maxDiscount: null,
      minPurchase: 0,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      applicableTo: "all",
      maxUsageTotal: null,
      maxUsagePerMember: null,
      priority: 0,
      isCombinable: false,
      autoActivate: false
    }
  });

  const createMutation = useMutation(createCampaign, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.promo.toast.createSuccess")
      });
      queryClient.invalidateQueries(["promo-campaigns"]);
      navigate("/promo-list");
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message
      });
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const values = form.getValues();
    const missing = getMissingFields(values, schema, promoFieldLabels);
    if (missing.length > 0) {
      setMissingFieldsList(missing);
      setMissingFieldsModal(true);
      return;
    }
    setConfirmSaveModal(true);
  };

  const [confirmSaveModal, setConfirmSaveModal] = useState(false);

  const onSubmit = (data) => {
    createMutation.mutate({ ...data, store: cookie?.activeStore, rules, rewards });
  };

  const addRule = () => {
    setRules([...rules, { ruleType: "time", condition: {}, priority: 0 }]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const addReward = () => {
    setRewards([...rewards, { rewardType: "discount_percentage", rewardValue: 0, quantity: 1, priority: 0 }]);
  };

  const removeReward = (index) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index, field, value) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
  };

  const watchedType = form.watch("type");

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            href:
              user?.roleType === "super_admin"
                ? "/dashboard-super-admin"
                : user?.roleType === "admin"
                  ? "/dashboard-admin"
                  : "/home",
            i18nKey: "breadcrumb.home"
          },
          {
            href: "/promo-list",
            i18nKey: "sidebar.promo"
          },
          { i18nKey: "page.promo.add.title" }
        ]}
        title={t("page.promo.add.title")}
        description={t("page.promo.add.description")}>
        <Button variant="outline" onClick={() => setCancelModalOpen(true)}>
          {t("common.cancel")}
        </Button>
      </PageHeader>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.form.basicInfo")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  {t("page.promo.form.name")} <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("name")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder={t("page.promo.form.namePlaceholder")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.description")}</label>
                <textarea
                  {...form.register("description")}
                  className="mt-1 w-full h-20 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
                  placeholder={t("page.promo.form.descriptionPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.code")}</label>
                <input
                  {...form.register("code")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none uppercase"
                  placeholder={t("page.promo.form.codePlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.promo.form.type")} <span className="text-destructive">*</span>
                </label>
                <select
                  {...form.register("type")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                  <option value="happy_hour">Happy Hour</option>
                  <option value="birthday">Birthday</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                  <option value="spend_get">Spend & Get</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.form.discountSettings")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.discountType")}</label>
                <select
                  {...form.register("discountType")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.discountValue")}</label>
                <input
                  type="number"
                  {...form.register("discountValue", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.maxDiscount")}</label>
                <input
                  type="number"
                  {...form.register("maxDiscount", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.minPurchase")}</label>
                <input
                  type="number"
                  {...form.register("minPurchase", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("page.promo.form.schedule")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.promo.form.startDate")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...form.register("startDate")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("page.promo.form.endDate")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...form.register("endDate")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              {watchedType === "happy_hour" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t("page.promo.form.startTime")}</label>
                    <input
                      type="time"
                      {...form.register("startTime")}
                      className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t("page.promo.form.endTime")}</label>
                    <input
                      type="time"
                      {...form.register("endTime")}
                      className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t("page.promo.form.rules")}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                <Plus size={14} className="mr-1" />
                {t("page.promo.form.addRule")}
              </Button>
            </div>
            {rules.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("page.promo.form.noRules")}</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                    <select
                      value={rule.ruleType}
                      onChange={(e) => updateRule(index, "ruleType", e.target.value)}
                      className="h-8 px-2 bg-background border border-input rounded text-sm">
                      <option value="time">Time</option>
                      <option value="birthday">Birthday</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                      <option value="spend_threshold">Spend Threshold</option>
                      <option value="member_tier">Member Tier</option>
                      <option value="first_purchase">First Purchase</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => removeRule(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rewards */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t("page.promo.form.rewards")}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addReward}>
                <Plus size={14} className="mr-1" />
                {t("page.promo.form.addReward")}
              </Button>
            </div>
            {rewards.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("page.promo.form.noRewards")}</p>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                    <select
                      value={reward.rewardType}
                      onChange={(e) => updateReward(index, "rewardType", e.target.value)}
                      className="h-8 px-2 bg-background border border-input rounded text-sm">
                      <option value="discount_percentage">Discount %</option>
                      <option value="discount_fixed">Discount Fixed</option>
                      <option value="free_item">Free Item</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                      <option value="points_multiplier">Points Multiplier</option>
                      <option value="cashback">Cashback</option>
                    </select>
                    <input
                      type="number"
                      value={reward.rewardValue}
                      onChange={(e) => updateReward(index, "rewardValue", parseInt(e.target.value) || 0)}
                      className="h-8 w-24 px-2 bg-background border border-input rounded text-sm"
                      placeholder="Value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => removeReward(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{t("page.promo.form.tipsTitle")}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{t("page.promo.form.tipsContent")}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.applicableTo")}</label>
                <select
                  {...form.register("applicableTo")}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none">
                  <option value="all">All Products</option>
                  <option value="specific_products">Specific Products</option>
                  <option value="specific_categories">Specific Categories</option>
                  <option value="specific_members">Specific Members</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.maxUsageTotal")}</label>
                <input
                  type="number"
                  {...form.register("maxUsageTotal", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.maxUsagePerMember")}</label>
                <input
                  type="number"
                  {...form.register("maxUsagePerMember", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("page.promo.form.priority")}</label>
                <input
                  type="number"
                  {...form.register("priority", { valueAsNumber: true })}
                  className="mt-1 w-full h-10 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register("isCombinable")}
                  className="h-4 w-4"
                />
                <label className="text-sm text-foreground">{t("page.promo.form.isCombinable")}</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register("autoActivate")}
                  className="h-4 w-4"
                />
                <label className="text-sm text-foreground">{t("page.promo.form.autoActivate")}</label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCancelModalOpen(true)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation?.isLoading}>
                {createMutation?.isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        type="confirm"
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title={t("page.promo.modal.cancelTitle")}
        description={t("page.promo.modal.cancelDescription")}
        confirmText={t("page.promo.modal.confirmCancel")}
        onConfirm={() => navigate("/promo-list")}
      />
      <Modal
        type="confirm"
        open={confirmSaveModal}
        onOpenChange={setConfirmSaveModal}
        title="Konfirmasi Simpan"
        description="Apakah Anda yakin ingin menyimpan data ini?"
        confirmText="Ya, Simpan"
        onConfirm={() => {
          setConfirmSaveModal(false);
          onSubmit(form.getValues());
        }}
      />
      <MissingFieldsModal
        open={missingFieldsModal}
        onOpenChange={setMissingFieldsModal}
        fields={missingFieldsList}
      />
    </div>
  );
};

export default AddPromoCampaign;
