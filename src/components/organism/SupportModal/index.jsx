/* eslint-disable react/prop-types */
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LifeBuoy, BookOpen, MessageCircle, Bug, ChevronRight, Smartphone } from "lucide-react";
import { useTourStore } from "@/state/tour";

const supportOptions = [
  {
    icon: LifeBuoy,
    title: "Tur Panduan Interaktif",
    desc: "Jelajahi fitur langkah demi langkah",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-950/80",
    border: "border-blue-200 dark:border-blue-800",
    action: "tour"
  },
  {
    icon: BookOpen,
    title: "Pusat Bantuan",
    desc: "Panduan & dokumentasi fitur",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-950/80",
    border: "border-emerald-200 dark:border-emerald-800",
    action: "help"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    desc: "Chat langsung dengan tim kami",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    hoverBg: "hover:bg-green-100 dark:hover:bg-green-950/80",
    border: "border-green-200 dark:border-green-800",
    action: "wa"
  },
  {
    icon: Bug,
    title: "Laporkan Bug",
    desc: "Temukan masalah? Beri tahu kami",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-950/80",
    border: "border-orange-200 dark:border-orange-800",
    action: "bug"
  },
  {
    icon: Smartphone,
    title: "Info Aplikasi",
    desc: "Versi 1.0.0 - BisaNota POS",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-950/80",
    border: "border-purple-200 dark:border-purple-800",
    action: "info"
  }
];

const SupportModal = ({ open, onOpenChange }) => {
  const { startTour } = useTourStore();

  const handleAction = (action) => {
    switch (action) {
      case "tour":
        onOpenChange(false);
        setTimeout(() => startTour(), 300);
        break;
      case "help":
        window.open("/faq", "_blank");
        break;
      case "wa":
        window.open("https://wa.me/6281234567890", "_blank");
        break;
      case "bug":
        window.open("mailto:support@bisnota.com?subject=Laporan%20Bug", "_blank");
        break;
      case "info":
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <LifeBuoy size={20} className="text-primary" />
            Pusat Bantuan & Dukungan
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {supportOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.action}
                onClick={() => handleAction(opt.action)}
                className={`flex items-center gap-4 p-4 rounded-xl border ${opt.bg} ${opt.hoverBg} ${opt.border} transition-all group text-left`}>
                <div className={`p-2.5 rounded-lg ${opt.bg} ${opt.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{opt.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
