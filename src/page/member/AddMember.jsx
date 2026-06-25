import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { z } from "zod";
import { addMember } from "@/services/member";
import { getAllMemberTier } from "@/services/member-tier";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import UserGuide from "@/components/organism/UserGuide";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().min(1).max(14, "Max 14 characters"),
  birthDate: z.date(),
  gender: z.enum(["male", "female"]),
  address: z.string().optional().default(""),
  tier: z.number().nullable().optional().default(null),
  initialPoints: z.number().optional().default(0)
});

const AddMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies(["user"]);
  const user = cookie?.user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    birthDate: undefined,
    gender: "male",
    address: "",
    tier: "",
    initialPoints: 0
  });

  const { data: tiersData } = useQuery(
    ["member-tiers-active"],
    () => getAllMemberTier({ status: "active" }),
    {
      staleTime: 5 * 60 * 1000
    }
  );
  const tiers = tiersData?.data || tiersData?.tiers || [];

  const createMutation = useMutation(addMember, {
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries(["members"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.member.add.errorGagal"), {
        description: err?.response?.data?.message || err.message
      });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === "phoneNumber" ? value.replace(/\D/g, "") : value;
    setForm((prev) => ({
      ...prev,
      [name]: name === "tier" ? Number(sanitized) || null : sanitized
    }));
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!saveAsDraft) {
      const result = formSchema.safeParse(form);
      if (!result.success) {
        toast.error(t("page.member.add.toastValidation"), {
          description: t("page.member.add.validationDesc")
        });
        return;
      }
    }
    setIsSubmitting(true);
    createMutation.mutate({
      nameMember: form.name,
      phoneNumber: form.phoneNumber,
      email: form.email || undefined,
      birthDate: form.birthDate ? format(form.birthDate, "yyyy-MM-dd") : "",
      gender: form.gender,
      address: form.address,
      tier: form.tier || null,
      point: form.initialPoints,
      createdBy: user?.id,
      status: saveAsDraft ? "draft" : "active"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              { label: t("breadcrumb.home") },
              { label: t("breadcrumb.management") },
              { label: t("breadcrumb.add") }
            ]}
            title={t("breadcrumb.add")}
            description={t("page.member.add.description")}>
            <UserGuide guideKey="add-member" />
          </PageHeader>
        </div>
      </div>
      <div>
        <div>
          <div className="bg-card p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-border overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <span className="material-symbols-outlined">person</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.member.form.personalInfo")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("page.member.add.fullName")}{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                          placeholder={t("page.member.add.namePlaceholder")}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("page.member.add.email")}
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                          placeholder={t("page.member.add.emailPlaceholder")}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("page.member.add.phoneNumber")}{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          name="phoneNumber"
                          type="tel"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                          placeholder={t("page.member.add.phonePlaceholder")}
                          maxLength={14}
                          required
                        />
                        <p className="text-xs text-muted-foreground">{t("common.phoneHint")}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("page.member.add.dateOfBirth")}{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <DatePicker
                          date={form.birthDate}
                          setDate={(date) => setForm({ ...form, birthDate: date })}
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("page.member.add.gender")}
                        </label>
                        <div className="flex gap-4">
                          <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={form.gender === "male"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span className="material-symbols-outlined text-primary">man</span>
                            <span className="text-sm font-medium">{t("page.member.add.male")}</span>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={form.gender === "female"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span className="material-symbols-outlined text-primary">woman</span>
                            <span className="text-sm font-medium">
                              {t("page.member.add.female")}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <span className="material-symbols-outlined">location_on</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.member.add.fullAddress")}
                      </h3>
                    </div>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm resize-none"
                      placeholder={t("page.member.add.addressPlaceholder")}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                    <div className="flex items-center gap-2 mb-6 text-primary relative">
                      <span className="material-symbols-outlined">military_tech</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.member.add.membershipTier")}
                      </h3>
                    </div>
                    <div className="space-y-3 relative">
                      {tiers.length === 0 ? (
                        <div className="text-center py-6">
                          <span className="material-symbols-outlined text-3xl text-muted-foreground block mb-2">
                            military_tech
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {t("page.member.add.noTier")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("page.member.add.noTierDesc")}
                          </p>
                        </div>
                      ) : (
                        <>
                          <Select
                            value={form.tier != null ? String(form.tier) : ""}
                            onValueChange={(val) =>
                              setForm((prev) => ({ ...prev, tier: val ? Number(val) : null }))
                            }>
                            <SelectTrigger className="w-full h-auto px-4 py-3 rounded-xl border-2 border-border bg-background text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [&>svg]:text-muted-foreground">
                              {(() => {
                                const sel = tiers.find((t) => t.id === form.tier);
                                if (sel) {
                                  return (
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: sel.color || "#6366f1" }}
                                      />
                                      <span>{sel.name}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <span className="text-muted-foreground">
                                    {t("page.member.add.selectTier")}
                                  </span>
                                );
                              })()}
                            </SelectTrigger>
                            <SelectContent className="rounded-xl min-w-[var(--radix-select-trigger-width)]">
                              {tiers.map((tier) => (
                                <SelectItem
                                  key={tier.id}
                                  value={String(tier.id)}
                                  className="py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ backgroundColor: tier.color || "#6366f1" }}
                                    />
                                    <span>{tier.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {(() => {
                            const selected = tiers.find((t) => t.id === form.tier);
                            if (!selected) return null;
                            return (
                              <div
                                className="rounded-xl border overflow-hidden mt-1"
                                style={{ borderColor: `${selected.color || "#6366f1"}30` }}>
                                <div
                                  className="p-4"
                                  style={{ backgroundColor: `${selected.color || "#6366f1"}08` }}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
                                      style={{ backgroundColor: selected.color || "#6366f1" }}>
                                      <span className="material-symbols-outlined">
                                        workspace_premium
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-foreground truncate">
                                        {selected.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        <span className="font-semibold">
                                          {selected.minPoints?.toLocaleString?.() || 0}
                                        </span>
                                        {" — "}
                                        <span className="font-semibold">
                                          {selected.maxPoints?.toLocaleString?.() || "∞"}
                                        </span>{" "}
                                        PTS
                                      </p>
                                    </div>
                                    {selected.discountPercent > 0 && (
                                      <div className="text-right shrink-0">
                                        <p
                                          className="text-lg font-bold"
                                          style={{ color: selected.color || "#6366f1" }}>
                                          {selected.discountPercent}%
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                          Diskon
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {selected.benefits?.length > 0 && (
                                  <div
                                    className="px-4 py-3 border-t"
                                    style={{ borderColor: `${selected.color || "#6366f1"}15` }}>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                      {t("page.member.benefits")}
                                    </p>
                                    <ul className="space-y-1.5">
                                      {selected.benefits.map((b, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-xs text-muted-foreground">
                                          <span
                                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                            style={{ backgroundColor: selected.color || "#6366f1" }}
                                          />
                                          {b}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                      <span className="material-symbols-outlined">stars</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {t("page.member.add.initialPoints")}
                      </h3>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {t("page.member.add.initialPoints")}
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        0 <span className="text-sm font-semibold text-muted-foreground">PTS</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {t("page.member.add.pointsInfo")}
                    </p>
                  </div>

                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-secondary mt-0.5 text-base">
                      info
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("page.member.add.dataConfirmation")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4 mt-8 bg-card border border-border rounded-xl p-4">
                <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  {t("breadcrumb.back")}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraftModal(true)}
                    disabled={isSubmitting}>
                    {t("page.member.add.saveDraft")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    <span className="material-symbols-outlined text-lg">save</span>
                    {t("page.member.button.save")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.member.add.successTitle")}
        description={t("page.member.add.successDescription")}
        onConfirm={() => navigate("/member-list")}
      />
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.member.add.cancelModalTitle")}
        confirmText={t("page.member.add.cancelModalConfirm")}
        onConfirm={() => navigate("/member-list")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.member.add.draftModalTitle")}
        description={t("page.member.add.draftModalDesc")}
        confirmText={t("page.member.add.draftModalConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          setIsSubmitting(true);
          createMutation.mutate({
            nameMember: form.name,
            phoneNumber: form.phoneNumber,
            email: form.email || undefined,
            birthDate: form.birthDate ? format(form.birthDate, "yyyy-MM-dd") : null,
            gender: form.gender,
            address: form.address,
            tier: form.tier || null,
            point: form.initialPoints,
            createdBy: user?.id,
            status: "draft"
          });
        }}
      />
    </div>
  );
};

export default AddMember;
