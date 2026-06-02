import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Image, FileText, Share2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

const InvoicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      title: t("page.invoice.logo"),
      description: t("page.invoice.logoDescription"),
      icon: Image,
      href: "/logo-invoice-list"
    },
    {
      title: t("page.invoice.footer"),
      description: t("page.invoice.footerDescription"),
      icon: FileText,
      href: "/footer-invoice-list"
    },
    {
      title: t("page.invoice.socialMedia"),
      description: t("page.invoice.socialMediaDescription"),
      icon: Share2,
      href: "/social-media-invoice-list"
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("breadcrumb.home"), href: "/dashboard" },
          { label: t("breadcrumb.invoice") }
        ]}
        title={t("page.invoice.title")}
        description={t("page.invoice.description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.href}
              onClick={() => navigate(card.href)}
              className="bg-card rounded-xl border border-border overflow-hidden p-6 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoicePage;
