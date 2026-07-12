import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { createUser } from "@/services/user";
import { getAllLocation } from "@/services/location";
import { getAllRole } from "@/services/role";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";

const AddAdmin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    locationId: "",
    role: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data: locationsData } = useQuery(["allLocations"], getAllLocation);
  const locations = locationsData?.data || locationsData?.locations || [];

  const { data: rolesData } = useQuery(["roles-all"], () => getAllRole(), {
    
  });
  const roles = rolesData?.data || rolesData?.roles || [];

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(["admins", "users"]);
      setIsSubmitting(false);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), { description: err?.response?.data?.message || err.message });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, saveAsDraft = false) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error(t("common.error"), { description: t("page.user.addAdmin.validationRequired") });
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({
      userName: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.password,
      phoneNumber: form.phoneNumber,
      store: form.locationId ? Number(form.locationId) : null,
      userType: "admin",
      status: saveAsDraft ? "draft" : "active"
    });
  };

  return (
    <div>
      <div>
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
              <span>{t("breadcrumb.management")}</span>
              <span>/</span>
              <button
                onClick={() => navigate("/user-list")}
                className="hover:text-primary transition-colors">
                {t("page.user.adminList.title")}
              </button>
              <span>/</span>
              <span className="text-primary font-semibold">{t("page.user.addAdmin.title")}</span>
            </nav>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {t("page.user.addAdmin.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("page.user.addAdmin.description")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-card rounded-xl shadow-sm border border-border p-6">
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.name")}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                    placeholder={t("page.user.form.namePlaceholder")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.email")}
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                    placeholder={t("page.user.form.emailPlaceholder")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.password")}
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm pr-10"
                      placeholder={t("page.user.form.passwordPlaceholder")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
                      <span className="material-symbols-outlined text-base">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.phone")}
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm"
                    placeholder={t("page.user.form.phonePlaceholder")}
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">{t("common.phoneHint")}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.location")}
                  </label>
                  <div className="relative">
                    <select
                      name="locationId"
                      value={form.locationId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all appearance-none bg-background text-sm">
                      <option value="">{t("page.user.form.locationPlaceholder")}</option>
                      {locations.map((loc) => (
                        <option key={loc.id || loc._id} value={loc.id || loc._id}>
                          {loc.name}
                        </option>
                      ))}
                      <option value="all">{t("page.user.form.locationAll")}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("page.user.form.role")}
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all appearance-none bg-background text-sm">
                      <option value="">{t("page.user.form.rolePlaceholder")}</option>
                      {roles.map((role) => (
                        <option key={role.id || role._id} value={role.name || role.role}>
                          {(role.name || role.role)
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-3 bg-muted p-4 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">
                    info
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("page.user.addAdmin.emailConfirmation")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("page.user.addAdmin.emailConfirmationDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-primary/10 text-primary-foreground p-6 rounded-xl shadow-sm border border-primary/20 overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-base font-semibold text-primary mb-2">
                  {t("page.user.addAdmin.accessGuide")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("page.user.addAdmin.accessGuideDesc")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <span>{t("page.user.addAdmin.superAdminRole")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <span>{t("page.user.addAdmin.financeRole")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    <span>{t("page.user.addAdmin.inventoryRole")}</span>
                  </li>
                </ul>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <span className="material-symbols-outlined text-[200px] text-primary">
                  admin_panel_settings
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                <span className="material-symbols-outlined text-5xl">image</span>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {t("page.user.addAdmin.dataSecurity")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("page.user.addAdmin.dataSecurityDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t("page.user.button.back")}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={isSubmitting}
              className="gap-2">
              <span className="material-symbols-outlined text-lg">save</span>
              Simpan sebagai Draft
            </Button>
            <Button
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="gap-2">
              <span className="material-symbols-outlined text-lg">save</span>
              {t("page.user.button.save")}
            </Button>
          </div>
        </div>

        {isSubmitting && <Loading fullscreen size="lg" label={t("common.saving")} />}

        <Modal
          type="success"
          open={successModal}
          onOpenChange={setSuccessModal}
          title={t("common.success")}
          onConfirm={() => navigate("/user-list")}
        />
        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={setCancelModal}
          title={t("modal.cancelTitle")}
          confirmText={t("modal.yesCancel")}
          onConfirm={() => navigate("/user-list")}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title="Simpan sebagai Draft?"
          description="Data yang belum lengkap bisa dilengkapi nanti"
          confirmText="Ya, Simpan Draft"
          onConfirm={() => {
            setDraftModal(false);
            setIsSubmitting(true);
            createMutation.mutate({
              userName: form.name,
              email: form.email,
              password: form.password,
              confirmPassword: form.password,
              phoneNumber: form.phoneNumber,
              store: form.locationId ? Number(form.locationId) : null,
              userType: "admin",
              status: "draft"
            });
          }}
        />
      </div>
    </div>
  );
};

export default AddAdmin;
