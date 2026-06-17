import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, Tag, User, Calendar, FileText, CreditCard, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getExpenseById } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const statusBadge = {
  pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const getStatusLabel = (t) => ({
  pending: t("page.expense.detail.statusPending"),
  approved: t("page.expense.detail.statusApproved"),
  rejected: t("page.expense.detail.statusRejected")
});

const fmtDate = (date) =>
  date ? new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const DetailExpense = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(
    ["expense", id],
    () => getExpenseById(id),
    { enabled: !!id }
  );

  if (isLoading) return <Loading fullscreen size="lg" label={t("page.expense.detail.loading")} />;

  const item = data?.data;
  if (!item) return <p className="text-center text-muted-foreground py-12">{t("page.expense.detail.notFound")}</p>;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <nav className="flex gap-2 mb-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/dashboard-super-admin")} className="hover:text-primary transition-colors">{t("page.expense.detail.breadcrumbDashboard")}</button>
            <span>/</span>
            <button onClick={() => navigate("/expense")} className="hover:text-primary transition-colors">{t("page.expense.detail.breadcrumbList")}</button>
            <span>/</span>
            <span className="text-primary font-semibold">{t("page.expense.detail.breadcrumb")}</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{item.description || t("page.expense.detail.fallbackTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {item.expenseNumber} &mdash; {fmtDate(item.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/edit-expense?id=${item.id}`)} className="gap-2">
            {t("page.expense.detail.editBtn")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/expense")} className="gap-2">
            <ArrowLeft size={16} /> {t("page.expense.detail.back")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-6">{t("page.expense.detail.infoTitle")}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.expenseNumber")}</p>
                <p className="text-sm font-medium">{item.expenseNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.status")}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || statusBadge.pending}`}>
                  {getStatusLabel(t)[item.status] || item.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.category")}</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Tag size={14} className="text-muted-foreground" />
                  {item.categoryData?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.amount")}</p>
                <p className="text-lg font-bold text-foreground">Rp {Number(item.amount || 0).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.paymentMethod")}</p>
                <p className="text-sm font-medium flex items-center gap-1 capitalize">
                  <CreditCard size={14} className="text-muted-foreground" />
                  {item.paymentMethod || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.date")}</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} className="text-muted-foreground" />
                  {fmtDate(item.date)}
                </p>
              </div>
            </div>
          </div>

          {item.notes && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText size={16} /> {t("page.expense.detail.notes")}
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          {item.receipt && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt size={16} /> {t("page.expense.detail.receipt")}
              </h3>
              <img src={item.receipt} alt={t("page.expense.detail.receiptAlt")} className="max-w-md rounded-lg border" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t("page.expense.detail.timeInfo")}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.created")}</p>
                <p className="text-sm">{fmtDate(item.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("page.expense.detail.updated")}</p>
                <p className="text-sm">{fmtDate(item.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={16} /> {t("page.expense.detail.creator")}
            </h3>
            <p className="text-sm font-medium">{item.creator?.fullName || item.creator?.name || "-"}</p>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">{t("page.expense.detail.actions")}</h3>
            <div className="space-y-3">
              <Button className="w-full" variant="default" onClick={() => navigate(`/edit-expense?id=${item.id}`)}>
                {t("page.expense.detail.editBtn")}
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/expense")}>
                {t("page.expense.detail.backToList")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

export default DetailExpense;
