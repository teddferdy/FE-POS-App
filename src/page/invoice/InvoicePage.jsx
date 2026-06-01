/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Image, FileText, Share2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

const cards = [
  {
    title: "Logo Invoice",
    description: "Manage invoice logo",
    icon: Image,
    href: "/logo-invoice-list"
  },
  {
    title: "Footer Invoice",
    description: "Manage invoice footer",
    icon: FileText,
    href: "/footer-invoice-list"
  },
  {
    title: "Social Media Invoice",
    description: "Manage social media on invoice",
    icon: Share2,
    href: "/social-media-invoice-list"
  }
];

const InvoicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Invoice" }]}
        title="Invoice Configuration"
        description="Configure invoice settings including logo, footer, and social media."
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
