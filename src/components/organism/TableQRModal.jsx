import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Modal from "@/components/organism/modal";
import { randomToken } from "@/utils/secureRandom";
import { escapeHtml } from "@/utils/htmlEscape";

const TableQRModal = ({ open, onOpenChange, table }) => {
  const { t } = useTranslation();
  const qrRef = useRef(null);

  const storeId =
    table &&
    (typeof table.store === "object" && table.store !== null
      ? String(table.store.id || table.store._id || "")
      : String(table.store || ""));

  const orderAppBaseUrl = import.meta.env.VITE_ORDER_APP_URL || "https://order-app-dun.vercel.app";

  const sessionId = React.useMemo(() => randomToken(), []);

  if (!table) return null;

  const orderUrl = `${orderAppBaseUrl}/?table=${table.id}&store=${storeId}&source=qr&session=${sessionId}`;

  const handlePrint = () => {
    // ponytail: blob URL menggantikan document.write (sink XSS Codacy);
    // sekalian benahi bug template lama yang menuliskan {t(...)} apa adanya
    const qrSvg = qrRef.current?.innerHTML || "";
    const html = `
      <html>
        <head>
          <title>${escapeHtml(t("tableQR.title", { name: table.name }))}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .print-area { text-align: center; }
            svg { width: 300px; height: 300px; }
            p { margin-top: 16px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="print-area">
            ${qrSvg}
            <p>${escapeHtml(t("tableQR.scanToOrder", { name: table.name }))}</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const printWindow = window.open(url, "_blank");
    if (printWindow) setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <Modal
      type="custom"
      open={open}
      onOpenChange={onOpenChange}
      title={t("tableQR.title", { name: table.name })}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div ref={qrRef} className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={orderUrl} size={200} />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {t("tableQR.scanToOrder", { name: table.name })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(orderUrl)}>
            Salin Tautan
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={18} className="mr-1" />
            Print
          </Button>
          <Button size="sm" onClick={() => window.open(orderUrl, "_blank")}>
            Buka Halaman
          </Button>
        </div>
      </div>
    </Modal>
  );
};

TableQRModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    store: PropTypes.string
  })
};

export default TableQRModal;
