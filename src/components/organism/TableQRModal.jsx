import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/organism/modal";

const TableQRModal = ({ open, onOpenChange, table }) => {
  if (!table) return null;

  const baseUrl = window.location.origin;
  const storeId = new URLSearchParams(window.location.search).get("store") || "";
  const orderUrl = `${baseUrl}/customer-order?table=${table.id}&store=${storeId}`;

  return (
    <Modal
      type="custom"
      open={open}
      onOpenChange={onOpenChange}
      title={`QR Code - ${table.name}`}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={orderUrl} size={200} />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Scan QR ini untuk memesan dari meja {table.name}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(orderUrl);
            }}
          >
            Salin Tautan
          </Button>
          <Button
            size="sm"
            onClick={() => window.open(orderUrl, "_blank")}
          >
            Buka Halaman
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TableQRModal;
