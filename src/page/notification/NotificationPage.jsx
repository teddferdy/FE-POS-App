import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, Package, AlertTriangle, CreditCard, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: 1,
    icon: Package,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "page.notification.item1.title",
    description: "page.notification.item1.desc",
    time: "2m",
    unread: true
  },
  {
    id: 2,
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "page.notification.item2.title",
    description: "page.notification.item2.desc",
    time: "1h",
    unread: true
  },
  {
    id: 3,
    icon: CreditCard,
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    title: "page.notification.item3.title",
    description: "page.notification.item3.desc",
    time: "3h",
    unread: false
  }
];

const NotificationPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState(notifications);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const dismiss = (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = items.filter((n) => n.unread).length;

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
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck size={16} />
            {t("page.notification.markAllRead")}
          </Button>
        )}
      </PageHeader>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={48} className="text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-foreground">{t("page.notification.empty")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("page.notification.emptyDesc")}</p>
          </div>
        ) : (
          items.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  notif.unread
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border hover:bg-accent/50"
                }`}>
                <div className={`p-2.5 rounded-full shrink-0 ${notif.iconBg} ${notif.iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${notif.unread ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {t(notif.title)}
                    </p>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {t(notif.description)}
                  </p>
                </div>
                <button
                  onClick={() => dismiss(notif.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
