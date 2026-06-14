import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  Package,
  AlertTriangle,
  X,
  User,
  Building2,
  ShoppingCart,
  DollarSign,
  Tag,
  Truck,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { getAllNotifications, markAsRead, markAllAsRead } from "@/services/notification";
import { useSocket } from "@/services/socket";

const typeIcons = {
  employee_created: {
    icon: User,
    bg: "bg-blue-100 dark:bg-blue-900/40",
    color: "text-blue-600 dark:text-blue-400"
  },
  employee_updated: {
    icon: User,
    bg: "bg-blue-100 dark:bg-blue-900/40",
    color: "text-blue-600 dark:text-blue-400"
  },
  employee_deleted: {
    icon: User,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-600 dark:text-red-400"
  },
  location_created: {
    icon: Building2,
    bg: "bg-purple-100 dark:bg-purple-900/40",
    color: "text-purple-600 dark:text-purple-400"
  },
  location_updated: {
    icon: Building2,
    bg: "bg-purple-100 dark:bg-purple-900/40",
    color: "text-purple-600 dark:text-purple-400"
  },
  location_deleted: {
    icon: Building2,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-600 dark:text-red-400"
  },
  product_created: {
    icon: Package,
    bg: "bg-green-100 dark:bg-green-900/40",
    color: "text-green-600 dark:text-green-400"
  },
  product_updated: {
    icon: Package,
    bg: "bg-green-100 dark:bg-green-900/40",
    color: "text-green-600 dark:text-green-400"
  },
  product_deleted: {
    icon: Package,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-600 dark:text-red-400"
  },
  category_created: {
    icon: Tag,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    color: "text-amber-600 dark:text-amber-400"
  },
  category_updated: {
    icon: Tag,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    color: "text-amber-600 dark:text-amber-400"
  },
  category_deleted: {
    icon: Tag,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-600 dark:text-red-400"
  },
  supplier_created: {
    icon: Truck,
    bg: "bg-teal-100 dark:bg-teal-900/40",
    color: "text-teal-600 dark:text-teal-400"
  },
  supplier_updated: {
    icon: Truck,
    bg: "bg-teal-100 dark:bg-teal-900/40",
    color: "text-teal-600 dark:text-teal-400"
  },
  supplier_deleted: {
    icon: Truck,
    bg: "bg-red-100 dark:bg-red-900/40",
    color: "text-red-600 dark:text-red-400"
  },
  order_created: {
    icon: ShoppingCart,
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    color: "text-indigo-600 dark:text-indigo-400"
  },
  payment_received: {
    icon: DollarSign,
    bg: "bg-green-100 dark:bg-green-900/40",
    color: "text-green-600 dark:text-green-400"
  },
  low_stock: {
    icon: AlertTriangle,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    color: "text-amber-600 dark:text-amber-400"
  },
  stock_opname_created: {
    icon: FileText,
    bg: "bg-cyan-100 dark:bg-cyan-900/40",
    color: "text-cyan-600 dark:text-cyan-400"
  },
  expense_created: {
    icon: DollarSign,
    bg: "bg-orange-100 dark:bg-orange-900/40",
    color: "text-orange-600 dark:text-orange-400"
  },
  member_created: {
    icon: User,
    bg: "bg-pink-100 dark:bg-pink-900/40",
    color: "text-pink-600 dark:text-pink-400"
  },
  shift_created: {
    icon: FileText,
    bg: "bg-gray-100 dark:bg-gray-900/40",
    color: "text-gray-600 dark:text-gray-400"
  },
  discount_created: {
    icon: Tag,
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    color: "text-yellow-600 dark:text-yellow-400"
  }
};

const defaultIcon = {
  icon: Bell,
  bg: "bg-gray-100 dark:bg-gray-900/40",
  color: "text-gray-600 dark:text-gray-400"
};

const NotificationPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { newNotification, setNewNotification } = useSocket() || {};
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ["notifications", page],
    () => getAllNotifications({ page, limit: 20 }),
    { keepPreviousData: true }
  );

  const { mutate: readMutate } = useMutation(markAsRead, {
    onSuccess: () => queryClient.invalidateQueries(["notifications"])
  });

  const { mutate: readAllMutate } = useMutation(markAllAsRead, {
    onSuccess: () => queryClient.invalidateQueries(["notifications"])
  });

  useEffect(() => {
    if (newNotification) {
      queryClient.invalidateQueries(["notifications"]);
      setNewNotification(null);
    }
  }, [newNotification, queryClient, setNewNotification]);

  const items = data?.data || [];
  const pagination = data?.pagination || {};
  const unreadCount = items.filter((n) => !n.isRead).length;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home", href: "/dashboard-super-admin" },
          { i18nKey: "page.notification.title" }
        ]}
        title={t("page.notification.title")}
        description={t("page.notification.description")}>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => readAllMutate()}>
            <CheckCheck size={16} />
            {t("page.notification.markAllRead")}
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <Loading fullscreen size="lg" label="Memuat data..." />
      ) : (
        <>
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bell size={48} className="text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-foreground">
                  {t("page.notification.empty")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("page.notification.emptyDesc")}
                </p>
              </div>
            ) : (
              items.map((notif) => {
                const iconConfig = typeIcons[notif.type] || defaultIcon;
                const Icon = iconConfig.icon;
                return (
                  <div
                    key={notif.id}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                      !notif.isRead
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:bg-accent/50"
                    }`}>
                    <div
                      className={`p-2.5 rounded-full shrink-0 ${iconConfig.bg} ${iconConfig.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${!notif.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.description}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => readMutate(notif.id)}
                        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationPage;
