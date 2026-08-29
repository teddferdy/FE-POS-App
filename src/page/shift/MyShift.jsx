import React, { useState } from "react";
import { useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import {
  ArrowRightLeft,
  CalendarClock,
  CalendarDays,
  Clock,
  Clock3,
  Store,
  RefreshCcw
} from "lucide-react";
import { getAllShift } from "@/services/shift";
import { getAllLocation } from "@/services/location";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/StatCard";
import { useUserSession } from "@/hooks/useUserSession";
import SwapShiftModal from "./SwapShiftModal";
import { safeGet } from "@/lib/safe-lookup";
import PageHeader from "@/components/ui/PageHeader";

const DAY_MS = 86400000;

const fmtDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const hoursBetween = (start, end) => {
  const [ah, am] = (start || "").split(":").map(Number);
  const [bh, bm] = (end || "").split(":").map(Number);
  if ([ah, am, bh, bm].some((n) => isNaN(n))) return null;
  let minutes = bh * 60 + bm - (ah * 60 + am);
  if (minutes <= 0) minutes += 1440;
  return minutes / 60;
};

const MetadataTile = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
    <Icon size={14} className="shrink-0 text-muted-foreground/70" />
    <span className="font-medium text-foreground/90">{children}</span>
  </span>
);

const MyShift = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const user = useUserSession() || cookie?.user || {};
  const [swapShift, setSwapShift] = useState(null);

  const currentUserId = user?.id;
  const storeId = user?.store || "";

  const { data, isLoading, isError, isFetching, refetch } = useQuery(
    ["my-shift", storeId],
    () => getAllShift({ store: storeId, page: 1, limit: 100, statusShift: "active" }),
    {
      enabled: !!storeId,
      retry: 0
    }
  );

  const allShifts = data?.data || data?.shifts || [];

  const rows = allShifts.filter((s) =>
    (s.karyawan || []).some((k) => String(k) === String(currentUserId))
  );

  const { data: locData } = useQuery(
    ["my-shift-locations", storeId],
    () => getAllLocation("active"),
    { enabled: !!storeId }
  );

  const locName = (sid) => {
    if (sid == null || sid === "") return "";
    const loc = (locData?.data || []).find((l) => String(l.id) === String(sid));
    return loc?.name || "";
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = today.getTime();
  const dayEnd = dayStart + DAY_MS;

  const category = (s) => {
    const start = new Date(s.tanggal_mulai);
    const startT = isNaN(start.getTime()) ? null : start.getTime();
    const end = s.tanggal_selesai ? new Date(s.tanggal_selesai) : null;
    const endT = end && !isNaN(end.getTime()) ? new Date(end).setHours(23, 59, 59, 999) : null;
    if (startT !== null && startT > dayEnd) return "upcoming";
    if (endT !== null && endT < dayStart) return "past";
    return "ongoing";
  };

  const grouped = { ongoing: [], upcoming: [], past: [] };
  rows.forEach((s) => grouped[category(s)].push(s));
  Object.keys(grouped).forEach((k) =>
    safeGet(grouped, k)?.sort((a, b) => new Date(a.tanggal_mulai) - new Date(b.tanggal_mulai))
  );

  const swappableShifts = [...grouped.ongoing, ...grouped.upcoming];

  const relDays = (s) => {
    const start = new Date(s.tanggal_mulai);
    start.setHours(0, 0, 0, 0);
    const diff = Math.round((start.getTime() - dayStart) / DAY_MS);
    if (diff < 0) return null;
    if (diff === 0) return t("page.shift.myShift.relToday");
    if (diff === 1) return t("page.shift.myShift.relTomorrow");
    return t("page.shift.myShift.relDays", { count: diff });
  };

  const badgeCls = {
    ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    past: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  };
  const dotCls = {
    ongoing: "bg-green-500 animate-pulse",
    upcoming: "bg-blue-500",
    past: "bg-gray-400"
  };

  const statusLabel = (s, cat) => {
    if (cat === "past") return t("page.shift.myShift.relEnded");
    if (cat === "ongoing") return relDays(s) || t("page.shift.myShift.relOngoing");
    return relDays(s) || t("page.shift.myShift.relSoon");
  };

  const renderCard = (s, cat) => {
    const name = locName(s.store);
    const dur = hoursBetween(s.jam_mulai, s.jam_selesai);
    return (
      <div
        key={s.id}
        className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
            <Clock size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground truncate">{s.nama_shift || "-"}</p>
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold capitalize">
                {s.tipe_shift || "harian"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
              <Store size={12} className="shrink-0" />
              {name || t("page.shift.myShift.allStore")}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${safeGet(badgeCls, cat, "")}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${safeGet(dotCls, cat, "")}`} />
            {statusLabel(s, cat)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 bg-muted/40 border-t border-border/50 text-[13px]">
          <MetadataTile icon={Clock3}>
            <span className="font-mono">
              {s.jam_mulai?.slice(0, 5)} - {s.jam_selesai?.slice(0, 5)}
            </span>
          </MetadataTile>
          <span className="hidden sm:block text-border">|</span>
          <MetadataTile icon={CalendarDays}>
            {fmtDate(s.tanggal_mulai)}
            {s.tanggal_selesai ? ` – ${fmtDate(s.tanggal_selesai)}` : ""}
          </MetadataTile>
          {dur !== null && (
            <>
              <span className="hidden sm:block text-border">|</span>
              <MetadataTile icon={CalendarClock}>
                {t("page.shift.myShift.duration", {
                  hours: dur % 1 === 0 ? dur : dur.toFixed(1)
                })}
              </MetadataTile>
            </>
          )}
          {cat !== "past" && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto h-8 gap-1.5 text-xs"
              onClick={() => setSwapShift(s)}>
              <ArrowRightLeft size={13} className="text-primary" />
              {t("page.shift.myShift.swap")}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-8 py-14 text-center">
          <CalendarClock size={32} className="text-destructive/70" />
          <p className="text-sm font-semibold text-destructive">{t("page.shift.myShift.error")}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
          { i18nKey: "page.shift.myShift.title" }
        ]}
        title={t("page.shift.myShift.title")}
        description={t("page.shift.myShift.subtitle")}
        backLink="/shift-list"
        onBack={() => {}}>
        {!isLoading && rows.length > 0 && (
          <>
            {swappableShifts.length > 0 && (
              <Button size="sm" onClick={() => setSwapShift({})}>
                <ArrowRightLeft size={14} />
                {t("page.shift.myShift.swap")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
              {t("page.shift.myShift.refresh")}
            </Button>
          </>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 px-8 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <CalendarClock size={26} className="text-muted-foreground/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t("page.shift.myShift.empty")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("page.shift.myShift.emptyHint")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            <StatCard
              label={t("page.shift.myShift.statTotal")}
              value={rows.length}
              icon={CalendarClock}
              variant="default"
            />
            <StatCard
              label={t("page.shift.myShift.statOngoing")}
              value={grouped.ongoing.length}
              icon={Clock}
              variant="active"
            />
            <StatCard
              label={t("page.shift.myShift.statUpcoming")}
              value={grouped.upcoming.length}
              icon={CalendarDays}
              variant="blue"
            />
          </div>

          {[
            ["ongoing", "secOngoing"],
            ["upcoming", "secUpcoming"],
            ["past", "secPast"]
          ].map(([cat, secKey]) => {
            const list = safeGet(grouped, cat, []);
            if (list.length === 0) return null;
            return (
              <section key={cat} className="mb-8 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    {t(`page.shift.myShift.${secKey}`)}
                  </h2>
                  <span className="rounded-full bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5">
                    {list.length}
                  </span>
                </div>
                <div className="space-y-3">{list.map((s) => renderCard(s, cat))}</div>
              </section>
            );
          })}
        </>
      )}

      <SwapShiftModal
        open={!!swapShift}
        onOpenChange={(v) => {
          if (!v) setSwapShift(null);
        }}
        storeId={storeId}
        currentUserId={currentUserId}
        swappableShifts={swappableShifts}
        allShifts={allShifts}
        initialShift={swapShift && swapShift.id ? swapShift : null}
      />
    </div>
  );
};

export default MyShift;
