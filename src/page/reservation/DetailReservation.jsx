/* eslint-disable react/prop-types */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { toast } from "sonner";
import { ArrowLeft, Phone } from "lucide-react";
import { getReservationById } from "@/services/reservation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const STATUS_MAP = {
  pending: {
    labelKey: "page.reservation.status.pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  confirmed: {
    labelKey: "page.reservation.status.confirmed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  cancelled: {
    labelKey: "page.reservation.status.cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  },
  completed: {
    labelKey: "page.reservation.status.completed",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  no_show: {
    labelKey: "page.reservation.status.noShow",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }
};

const DetailRow = ({ label, children }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{children}</p>
  </div>
);

const DetailReservation = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(["reservation", id], () => getReservationById(id), {
    enabled: !!id
  });

  const r = data?.data;

  const sendWhatsApp = () => {
    if (!r?.customerPhone) {
      toast.error(t("page.reservation.detail.noPhone"));
      return;
    }
    const phone = r.customerPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Halo ${r.customerName},\n\nReservasi anda pada ${r.reservationDate} pukul ${r.startTime?.slice(0, 5)} telah dikonfirmasi.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.reservation.edit.notFound")}</p>
      </div>
    );
  }

  const s = STATUS_MAP[r.status] || STATUS_MAP.pending;

  return (
    <div className="space-y-6 w-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/reservation")}
          className="hover:text-foreground transition-colors">
          {t("page.reservation.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.reservation.detailTitle")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("page.reservation.detailTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.reservation.detail.subtitle")}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/reservation")} className="gap-2">
          <ArrowLeft size={16} /> {t("breadcrumb.back")}
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("page.reservation.detail.customer")}
            </h2>
            <DetailRow label={t("page.reservation.detail.name")}>{r.customerName}</DetailRow>
            {r.customerPhone && (
              <DetailRow label={t("page.reservation.detail.phone")}>{r.customerPhone}</DetailRow>
            )}
            {r.customerEmail && (
              <DetailRow label={t("page.reservation.detail.email")}>{r.customerEmail}</DetailRow>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("common.status")}
            </h2>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
              {t(s.labelKey)}
            </span>
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailRow label={t("page.reservation.columns.date")}>
            {r.reservationDate
              ? new Date(r.reservationDate + "T00:00:00").toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              : "-"}
          </DetailRow>
          <DetailRow label={t("page.reservation.columns.time")}>
            {r.startTime?.slice(0, 5)} - {r.endTime?.slice(0, 5)}
          </DetailRow>
          <DetailRow label={t("page.reservation.columns.guests")}>
            {r.guestCount} {t("page.reservation.guestSuffix")}
          </DetailRow>
          <DetailRow label={t("page.reservation.columns.table")}>
            {r.tableInfo?.name || "-"}
          </DetailRow>
          <DetailRow label={t("page.reservation.columns.store")}>
            {r.storeInfo?.name || `Store #${r.store}`}
          </DetailRow>
          <DetailRow label={t("page.reservation.columns.notes")}>{r.notes || "-"}</DetailRow>
        </div>

        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailRow label={t("page.reservation.createdBy")}>
            {r.createdByUser?.fullName || r.createdBy}
          </DetailRow>
          <DetailRow label={t("page.reservation.createdAt")}>
            {r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : "-"}
          </DetailRow>
          {r.modifiedBy && (
            <>
              <DetailRow label={t("page.reservation.modifiedBy")}>
                {r.modifiedByUser?.fullName || r.modifiedBy}
              </DetailRow>
              <DetailRow label={t("page.reservation.updatedAt")}>
                {r.updatedAt ? new Date(r.updatedAt).toLocaleString("id-ID") : "-"}
              </DetailRow>
            </>
          )}
        </div>
      </Card>

      {r.customerPhone && r.status === "confirmed" && (
        <div className="flex justify-end">
          <Button onClick={sendWhatsApp} className="gap-2">
            <Phone size={16} /> {t("page.reservation.detail.sendWA")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DetailReservation;
