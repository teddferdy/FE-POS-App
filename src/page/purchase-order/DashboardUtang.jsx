import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { Wallet, Building2, Clock, Eye } from "lucide-react";
import { getAPDashboard } from "@/services/purchase-payment";
import { getAllLocation } from "@/services/location";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import { Loading } from "@/components/ui/loading";
import NoStore from "@/components/ui/NoStore";
import AbortController from "@/components/organism/abort-controller";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const statusStyles = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  ordered: "bg-blue-100 text-blue-800",
  received: "bg-green-100 text-green-800"
};

const DashboardUtang = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie] = useCookies(["user"]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const { data: locData } = useQuery(["locations-ap-dashboard"], () => getAllLocation(), {
    staleTime: 5 * 60 * 1000,
    enabled: isSuperAdmin
  });

  const { data, isLoading, isError, refetch } = useQuery("ap-dashboard", getAPDashboard, {
    keepPreviousData: true
  });

  const { summary = {}, suppliers = [], outstandingPOs = [] } = data?.data || {};
  const supplierPOs = selectedSupplier
    ? outstandingPOs.filter((po) => po.supplierId === selectedSupplier.supplierId)
    : [];

  const supplierColumns = [
    {
      header: t("page.apDashboard.supplier.name"),
      render: (s) => (
        <span>
          <Building2 size={14} className="inline mr-1" />
          {s.supplierName}
        </span>
      )
    },
    {
      header: t("page.apDashboard.supplier.poCount"),
      align: "center",
      render: (s) => s.poCount
    },
    {
      header: t("page.apDashboard.supplier.totalPO"),
      align: "right",
      render: (s) => `Rp ${(s.totalPO || 0).toLocaleString("id-ID")}`
    },
    {
      header: t("page.apDashboard.supplier.totalPaid"),
      align: "right",
      render: (s) => (
        <span className="text-green-600">Rp {(s.totalPaid || 0).toLocaleString("id-ID")}</span>
      )
    },
    {
      header: t("page.apDashboard.supplier.outstanding"),
      align: "right",
      render: (s) => (
        <span className="font-semibold text-red-600">
          Rp {(s.outstanding || 0).toLocaleString("id-ID")}
        </span>
      )
    },
    {
      header: "",
      align: "center",
      render: (s) => (
        <button
          onClick={() => setSelectedSupplier(s)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
          title={t("page.apDashboard.detailTitle")}>
          <Eye size={16} />
        </button>
      )
    }
  ];

  const poColumns = [
    {
      header: t("page.apDashboard.po.noPO"),
      render: (po) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/purchase-order/detail?id=${po.id}`)}>
          {po.orderNumber || `PO-${po.id}`}
        </span>
      )
    },
    {
      header: t("page.apDashboard.po.supplier"),
      render: (po) => po.supplierName
    },
    {
      header: t("page.apDashboard.po.total"),
      align: "right",
      render: (po) => `Rp ${(po.finalAmount || 0).toLocaleString("id-ID")}`
    },
    {
      header: t("page.apDashboard.po.paid"),
      align: "right",
      render: (po) => `Rp ${(po.totalPaid || 0).toLocaleString("id-ID")}`
    },
    {
      header: t("page.apDashboard.po.outstanding"),
      align: "right",
      render: (po) => (
        <span className="font-semibold text-red-600">
          Rp {(po.outstanding || 0).toLocaleString("id-ID")}
        </span>
      )
    },
    {
      header: t("page.apDashboard.po.dueDate"),
      render: (po) => (po.dueDate ? new Date(po.dueDate).toLocaleDateString("id") : "-")
    },
    {
      header: t("page.apDashboard.po.overdue"),
      align: "center",
      render: (po) =>
        po.daysOverdue > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
            <Clock size={12} />
            {po.daysOverdue} {t("page.apDashboard.po.days")}
          </span>
        ) : (
          <span className="text-xs text-green-600">-</span>
        )
    },
    {
      header: t("page.apDashboard.po.status"),
      render: (po) => {
        const st = statusStyles[po.status] || "bg-gray-100";
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${st}`}>
            {po.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.home")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">{t("page.apDashboard.title")}</span>
        </nav>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.apDashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.apDashboard.subtitle")}</p>
      </div>

      {locData && (locData?.data || []).length === 0 ? (
        <NoStore />
      ) : (
        <>
          {isError ? (
            <AbortController refetch={refetch} />
          ) : isLoading ? (
            <Loading fullscreen size="lg" label={t("page.apDashboard.loading")} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <StatCard
                  label={t("page.apDashboard.card.supplierCount")}
                  value={summary.supplierCount || 0}
                  icon="business"
                />
                <StatCard
                  label={t("page.apDashboard.card.totalPaid")}
                  value={`Rp ${(summary.totalPaid || 0).toLocaleString("id-ID")}`}
                  icon="payments"
                  variant="active"
                />
                <StatCard
                  label={t("page.apDashboard.card.totalOutstanding")}
                  value={`Rp ${(summary.totalOutstanding || 0).toLocaleString("id-ID")}`}
                  icon="account_balance"
                  variant="inactive"
                />
                <StatCard
                  label={t("page.apDashboard.card.outstandingPO")}
                  value={summary.outstandingPOCount || 0}
                  icon="warning"
                  variant={summary.outstandingPOCount > 0 ? "inactive" : "default"}
                />
              </div>

              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-4">
                  {t("page.apDashboard.supplierTitle")}
                </h3>
                <DataTable
                  columns={supplierColumns}
                  data={suppliers}
                  isLoading={false}
                  emptyMessage={t("page.apDashboard.emptySuppliers")}
                  emptyIcon={Building2}
                />
              </Card>

              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-4">{t("page.apDashboard.poTitle")}</h3>
                <DataTable
                  columns={poColumns}
                  data={outstandingPOs}
                  isLoading={false}
                  emptyMessage={t("page.apDashboard.emptyPOs")}
                  emptyIcon={Wallet}
                />
              </Card>
            </>
          )}

          <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedSupplier?.supplierName} — {t("page.apDashboard.detailTitle")}
                </DialogTitle>
                <DialogDescription>
                  {supplierPOs.length} outstanding PO{supplierPOs.length !== 1 ? "s" : ""} — total
                  outstanding:{" "}
                  <strong>Rp {(selectedSupplier?.outstanding || 0).toLocaleString("id-ID")}</strong>
                </DialogDescription>
              </DialogHeader>
              <DataTable
                columns={poColumns}
                data={supplierPOs}
                isLoading={false}
                emptyMessage={t("page.apDashboard.emptyPOs")}
                emptyIcon={Wallet}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default DashboardUtang;
