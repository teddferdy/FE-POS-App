import React from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FileText, FileSpreadsheet } from "lucide-react";
import { getBusinessTripById } from "@/services/business-trip";
import Modal from "@/components/organism/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessTripDownloadModal = ({ open, onOpenChange, tripId, trip }) => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery(
    ["business-trip-download", tripId],
    () => getBusinessTripById(tripId),
    { enabled: open && !trip && !!tripId }
  );

  const detail = trip || data?.data;

  const handleDownload = async (format) => {
    if (!detail) return;
    try {
      if (format === "pdf") {
        const { downloadTripPdf } = await import("@/utils/businessTripPdf");
        await downloadTripPdf(detail, t);
      } else {
        const { downloadTripWorkbook } = await import("@/utils/businessTripExcel");
        downloadTripWorkbook(detail, t);
      }
      toast.success(t("page.businessTrip.list.toast.downloadSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(t("page.businessTrip.list.toast.downloadError"), {
        description: err?.response?.data?.message || err.message
      });
    }
  };

  const formatButtons = [
    {
      key: "excel",
      icon: FileSpreadsheet,
      labelKey: "page.businessTrip.download.excel",
      descKey: "page.businessTrip.download.excelDesc"
    },
    {
      key: "pdf",
      icon: FileText,
      labelKey: "page.businessTrip.download.pdf",
      descKey: "page.businessTrip.download.pdfDesc"
    }
  ];

  return (
    <Modal
      type="download"
      open={open}
      onOpenChange={onOpenChange}
      title={t("page.businessTrip.download.title")}
      description={t("page.businessTrip.download.description")}>
      {!detail && isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : detail ? (
        <div className="grid grid-cols-1 gap-3">
          {formatButtons.map(({ key, icon: Icon, labelKey, descKey }) => (
            <Button
              key={key}
              type="button"
              variant="general"
              className="h-auto justify-start gap-3 py-3"
              onClick={() => handleDownload(key)}>
              <Icon size={18} className="shrink-0" />
              <span className="text-left">
                <span className="block font-semibold">{t(labelKey)}</span>
                <span className="block text-xs font-normal opacity-80">{t(descKey)}</span>
              </span>
            </Button>
          ))}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
};

export default BusinessTripDownloadModal;
