import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plane,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  User
} from "lucide-react";
import { getBusinessTripById } from "@/services/business-trip";
import { FormalDocument, PrintButton } from "@/components/document/FormalDocument";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AbortController from "@/components/organism/abort-controller";

const statusBadge = {
  draft: {
    label: "businessTrip.status.draft",
    class: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400",
    icon: FileText
  },
  pending: {
    label: "businessTrip.status.pending",
    class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: Clock
  },
  approved: {
    label: "businessTrip.status.approved",
    class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2
  },
  rejected: {
    label: "businessTrip.status.rejected",
    class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle
  }
};

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (v) => {
  const d = toDate(v);
  return d
    ? d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "-";
};

const Row = ({ label, children }) => (
  <tr>
    <td className="py-2.5 text-muted-foreground w-44 align-top">{label}</td>
    <td className="py-2.5 font-medium">{children || "-"}</td>
  </tr>
);

const DetailBusinessTrip = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError, refetch } = useQuery(
    ["business-trip-detail", id],
    () => getBusinessTripById(id),
    { enabled: !!id }
  );
  const trip = data?.data;
  const st = statusBadge[trip?.status] || statusBadge.draft;
  const StatusIcon = st.icon;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("common.notFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;
  if (!trip && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Plane className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("common.notFound")}</p>
        <Button variant="danger" onClick={() => navigate("/business-trip")}>
          <ArrowLeft size={16} className="mr-2" />
          {t("page.businessTrip.list.title")}
        </Button>
      </div>
    );
  }

  const meta = [
    { label: t("page.businessTrip.detail.employee"), value: trip.employeeName },
    { label: t("page.businessTrip.detail.position"), value: trip.employeePosition },
    { label: t("page.businessTrip.detail.destination"), value: trip.destination },
    { label: t("page.businessTrip.detail.purpose"), value: trip.tripPurpose },
    { label: t("page.businessTrip.detail.departureDate"), value: formatDate(trip.departureDate) },
    { label: t("page.businessTrip.detail.returnDate"), value: formatDate(trip.returnDate) },
    {
      label: t("page.businessTrip.detail.budget"),
      value: trip.budget != null ? `Rp ${Number(trip.budget).toLocaleString("id-ID")}` : "-"
    },
    { label: t("page.businessTrip.detail.notes"), value: trip.notes }
  ];

  const spec = {
    title: t("page.businessTrip.detail.suratTugas"),
    number: trip.tripNumber,
    subtitle: t("page.businessTrip.detail.title"),
    meta,
    columns: [
      { key: "field", label: t("document.field"), align: "left" },
      { key: "value", label: t("document.value"), align: "left" }
    ],
    rows: meta.map((m) => ({ field: m.label, value: m.value || "-" })),
    signature: {
      preparedBy: trip.createdByUser?.fullName,
      knownBy: trip.approvedByUser?.fullName,
      approvedBy: trip.approvedByUser?.fullName
    },
    footerText: t("document.footerAuto")
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/business-trip")} className="hover:text-foreground">
          {t("page.businessTrip.list.title")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.businessTrip.detail.title")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/business-trip")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Plane size={24} />
          </div>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold leading-none text-foreground">
                  {trip.tripNumber}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("page.businessTrip.detail.title")}
                </p>
              </>
            )}
          </div>
        </div>
        <PrintButton />
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-48" />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/40">
              <StatusIcon size={20} className={st.class.split(" ").slice(0, 2).join(" ")} />
              <span className="text-sm font-semibold">{t(st.label)}</span>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/60">
                <Row label={t("page.businessTrip.detail.employee")}>
                  <span className="inline-flex items-center gap-1.5">
                    <User size={14} className="text-muted-foreground" /> {trip.employeeName}
                  </span>
                </Row>
                <Row label={t("page.businessTrip.detail.position")}>{trip.employeePosition}</Row>
                <Row label={t("page.businessTrip.detail.destination")}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-muted-foreground" /> {trip.destination}
                  </span>
                </Row>
                <Row label={t("page.businessTrip.detail.purpose")}>{trip.tripPurpose}</Row>
                <Row label={t("page.businessTrip.detail.departureDate")}>
                  {formatDate(trip.departureDate)}
                </Row>
                <Row label={t("page.businessTrip.detail.returnDate")}>
                  {formatDate(trip.returnDate)}
                </Row>
                <Row label={t("page.businessTrip.detail.budget")}>
                  {trip.budget != null ? `Rp ${Number(trip.budget).toLocaleString("id-ID")}` : "-"}
                </Row>
                <Row label={t("page.businessTrip.detail.notes")}>{trip.notes}</Row>
                <Row label={t("page.businessTrip.detail.approvedBy")}>
                  {trip.approvedByUser?.fullName || "-"}
                </Row>
              </tbody>
            </table>
          </Card>

          <div className="hidden print:block print-doc">
            <FormalDocument spec={spec} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailBusinessTrip;
