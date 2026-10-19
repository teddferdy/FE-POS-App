import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import Modal from "@/components/organism/modal";
import { Combobox } from "@/components/ui/combobox";
import { getAllLocation } from "@/services/location";
import { changeRoleUser } from "@/services/user";

const fieldLabelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

// ponytail: pindah toko akun yang sudah ada (PUT /auth/change-profile-user
// dengan { id, store } saja — BE mengabaikan field undefined). Hanya super
// admin global; BE menolak admin memindah toko (403).
const ChangeUserStoreModal = ({ target, currentStoreName, onClose, onChanged }) => {
  const { t } = useTranslation();
  const displayName = target?.fullName || target?.userName || "";
  const currentStore = target?.store != null ? String(target.store) : "";
  const [storeId, setStoreId] = useState("");
  const [error, setError] = useState(null);

  const { data: locData, isLoading: locLoading } = useQuery(
    ["locations-change-user-store"],
    () => getAllLocation(),
    { enabled: !!target }
  );
  const locations = locData?.data || [];

  const mutation = useMutation(changeRoleUser, {
    onSuccess: () => {
      toast.success(t("common.success"), {
        description: t("page.user.changeStore.success", { name: displayName })
      });
      onChanged?.();
      onClose();
    },
    onError: (err) => {
      setError(err?.response?.data?.message || err.message || t("page.user.changeStore.failed"));
    }
  });

  const submit = () => {
    if (!storeId) {
      setError(t("page.user.changeStore.required"));
      return false;
    }
    if (storeId === currentStore) {
      setError(t("page.user.changeStore.sameStore"));
      return false;
    }
    setError(null);
    mutation.mutate({ id: target.id, store: Number(storeId) });
    return false;
  };

  return (
    <Modal
      type="form"
      open={!!target}
      onOpenChange={(next) => !next && !mutation.isLoading && onClose()}
      title={t("page.user.changeStore.title")}
      description={t("page.user.changeStore.description", { name: displayName })}
      confirmText={t("page.user.changeStore.save")}
      loading={mutation.isLoading}
      onConfirm={submit}>
      <div className="space-y-4 py-2">
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabelClass}>{t("page.user.changeStore.current")}</span>
          <p className="text-sm text-foreground">
            {currentStoreName || t("page.user.changeStore.none")}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="change-user-store" className={fieldLabelClass}>
            {t("page.user.changeStore.newStore")} <span className="text-destructive">*</span>
          </label>
          <Combobox
            id="change-user-store"
            loading={locLoading}
            options={locations.map((loc) => ({
              value: String(loc.id ?? loc._id),
              label: loc.name
            }))}
            value={storeId}
            onChange={(v) => {
              setStoreId(v);
              setError(null);
            }}
            placeholder={t("page.user.form.locationPlaceholder")}
            searchPlaceholder={t("page.user.changeStore.search")}
          />
          <p className="text-xs text-muted-foreground">{t("page.user.changeStore.hint")}</p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

ChangeUserStoreModal.propTypes = {
  target: PropTypes.object,
  currentStoreName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func
};

export default ChangeUserStoreModal;
