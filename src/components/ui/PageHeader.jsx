import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Briefcase, CalendarDays, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/useUserSession";
import { useStore } from "@/contexts/StoreContext";
import { getDashboardHref } from "@/utils/role";

const PageHeader = ({
  breadcrumbs = [],
  title,
  description,
  children,
  backLink,
  onBack,
  dynamicInfo = true
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useUserSession();

  let store;
  try {
    store = useStore();
  } catch {
    store = null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backLink) {
      navigate(resolveHref(backLink));
    }
  };

  const resolveHref = (href) => (href === "/dashboard-super-admin" ? getDashboardHref(user) : href);

  const fullName = user?.fullName || user?.userName || "";
  const roleName = user?.roleName || user?.roleType || "";
  const positionName = user?.positionName || "";
  const storeName = store?.activeStoreName || user?.storeName || "";

  const dynamicDescription =
    fullName || roleName
      ? [t("pageHeader.greeting", { defaultValue: "Selamat datang" }), fullName, roleName]
          .filter(Boolean)
          .join(", ")
      : "";

  const todayLabel = new Date().toLocaleDateString(user?.locale || "id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const showMeta = dynamicInfo && (roleName || storeName || positionName);

  return (
    <header className="space-y-4">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={(crumb.i18nKey || crumb.label) + i}>
              {i > 0 && <span className="text-xs">/</span>}
              {crumb.href ? (
                <button
                  onClick={() => navigate(resolveHref(crumb.href))}
                  className="hover:text-foreground transition-colors whitespace-nowrap">
                  {crumb.i18nKey ? t(crumb.i18nKey) : crumb.label}
                </button>
              ) : (
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "text-primary font-semibold whitespace-nowrap"
                      : "whitespace-nowrap"
                  }>
                  {crumb.i18nKey ? t(crumb.i18nKey) : crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {backLink && (
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleBack}>
              <ArrowLeft size={16} />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            ) : dynamicDescription ? (
              <p className="text-sm text-muted-foreground mt-1">{dynamicDescription}</p>
            ) : null}
            {showMeta && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {roleName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium capitalize">
                    <Tag size={11} />
                    {roleName}
                  </span>
                )}
                {positionName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                    <Briefcase size={11} />
                    {positionName}
                  </span>
                )}
                {storeName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                    <Store size={11} />
                    {storeName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                  <CalendarDays size={11} />
                  {todayLabel}
                </span>
              </div>
            )}
          </div>
        </div>
        {children && (
          <div
            className="overflow-x-auto shrink-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="flex items-center gap-2 flex-nowrap">{children}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
