import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Combobox } from "@/components/ui/combobox";
import { getTenants } from "@/services/tenant";
import { useTenantManagePermission } from "@/hooks/useTenantManagePermission";

const P = "page.location.tenant";

// Target tenant for a store, shown only to platform actors (tenant.manage).
// A platform context carries no tenant of its own, so the backend requires an
// explicit target tenant to make a new store operational
// (TARGET_TENANT_REQUIRED). Tenant/store admins never see this field: their
// tenant comes from their own context.
const TenantSelectField = ({ value, onChange, error, optional = false }) => {
  const { t } = useTranslation();
  const { canManageTenants } = useTenantManagePermission();

  const { data, isLoading } = useQuery(
    ["tenants", "active-options"],
    () => getTenants({ status: "active", limit: 100 }),
    { enabled: canManageTenants, retry: false, refetchOnWindowFocus: false }
  );

  if (!canManageTenants) return null;

  const tenants = data?.data || [];
  const options = tenants.map((tenant) => ({
    value: String(tenant.id),
    label: `${tenant.name} (${tenant.code})`
  }));

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="location-tenant"
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t(`${P}.label`)} {!optional && <span className="text-destructive">*</span>}
      </label>
      <Combobox
        id="location-tenant"
        options={options}
        value={value ? String(value) : ""}
        onChange={(next) => onChange(next || "")}
        onClear={() => onChange("")}
        loading={isLoading}
        placeholder={t(`${P}.placeholder`)}
        searchPlaceholder={t("common.search")}
        emptyMessage={t(`${P}.empty`)}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t(optional ? `${P}.hintOptional` : `${P}.hint`)}{" "}
          <Link
            to="/tenant"
            className="font-medium text-primary underline-offset-2 hover:underline">
            {t(`${P}.manage`)}
          </Link>
        </p>
      )}
    </div>
  );
};

TenantSelectField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  optional: PropTypes.bool
};

export default TenantSelectField;

// BE lifecycle refusals about tenant ownership → localized message, or null
// when the error is about something else.
export const tenantErrorMessage = (t, error) => {
  const code = error?.response?.data?.code;
  const keys = {
    TARGET_TENANT_REQUIRED: `${P}.error.required`,
    STORE_TENANT_REQUIRED: `${P}.error.required`,
    TENANT_NOT_APPROVED: `${P}.error.notApproved`,
    TENANT_REASSIGNMENT_NOT_PERMITTED: `${P}.error.reassignment`
  };
  return keys[code] ? t(keys[code]) : null;
};
