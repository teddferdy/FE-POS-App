import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Modal from "@/components/organism/modal";

const TableQRModal = ({ open, onOpenChange, table }) => {
  const qrRef = useRef(null);

  if (!table) return null;

  const baseUrl = window.location.origin;
  const storeId = table.store || "";
  const orderUrl = `${baseUrl}/customer-order?table=${table.id}&store=${storeId}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${table.name}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .print-area { text-align: center; }
            svg { width: 300px; height: 300px; }
            p { margin-top: 16px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="print-area">
            ${qrRef.current?.innerHTML || ""}
            <p>Scan QR untuk memesan dari meja ${table.name}</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      type="custom"
      open={open}
      onOpenChange={onOpenChange}
      title={`QR Code - ${table.name}`}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        <div ref={qrRef} className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={orderUrl} size={200} />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Scan QR ini untuk memesan dari meja {table.name}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(orderUrl)}
          >
            Salin Tautan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer size={15} className="mr-1" />
            Print
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
