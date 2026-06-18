import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Search, Percent, ChevronRight, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getDiscount, deleteDiscount } from "@/services/discount";

const DiscountList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery(["discounts"], () => getDiscount());

  const discounts = data?.data || data || [];

  const deleteMutation = useMutation(deleteDiscount, {
    onSuccess: () => {
      queryClient.invalidateQueries("discounts");
      Toast.fire({ icon: "success", title: t("page.discount.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.discount.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.discount.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isActive = (startDate, endDate) => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const filteredDiscounts = discounts.filter((d) => {
    if (!search) return true;
    const name = (d.nameDiscount || d.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent size={20} className="text-primary" />
          <h1 className="text-xl font-bold">{t("page.discount.title")}</h1>
        </div>
        <Button size="sm" onClick={() => navigate("/discount/add")}>
          <Plus size={14} />
          {t("page.discount.add")}
        </Button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("page.discount.search")}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredDiscounts.map((discount, idx) => {
          const id = discount?.id || discount?._id || discount?.ID || "";
          const expired = isExpired(discount.endDate);
          const active = isActive(discount.startDate, discount.endDate);
          const isPercentage = discount.type === "percentage";
          const discountValue = discount.value || 0;

          return (
            <div
              key={id || idx}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      expired
                        ? "bg-muted/50 text-muted-foreground/50"
                        : active
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                    }`}>
                    <Percent size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{discount.nameDiscount || discount.name || "-"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-sm font-bold ${
                          isPercentage ? "text-primary" : "text-emerald-500"
                        }`}>
                        {isPercentage
                          ? `${discountValue}%`
                          : `Rp ${discountValue.toLocaleString("id-ID")}`}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          expired
                            ? "bg-muted/50 text-muted-foreground"
                            : active
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}>
                        {expired
                          ? t("page.discount.expired")
                          : active
                            ? t("page.discount.active")
                            : t("page.discount.scheduled")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/discount/edit/${id}`)}>
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(id)}>
                    <Trash2 size={14} />
                  </Button>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                </div>
              </div>
            </div>
          );
        })}
        {filteredDiscounts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Percent size={20} className="text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">{t("page.discount.noDiscounts")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountList;
