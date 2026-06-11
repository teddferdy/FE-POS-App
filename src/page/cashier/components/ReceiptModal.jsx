/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { X, Printer, Receipt, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendInvoiceWA, sendInvoiceEmail } from "@/services/invoice";

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const [showSendWA, setShowSendWA] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [waPhone, setWaPhone] = useState(data?.memberPhone || data?.phoneNumber || "");
  const [emailAddr, setEmailAddr] = useState(data?.memberEmail || data?.email || "");
  const [sending, setSending] = useState(false);

  const invoiceNumber = data?.invoice || data?.invoiceNumber || data?.noInvoice || "-";
  const items = data?.items || [];
  const subtotal = data?.subtotal || 0;
  const serviceCharge = data?.serviceCharge || 0;
  const paid = data?.paid || subtotal;
  const change = data?.change || 0;
  const paymentMethod = data?.paymentMethod || "Cash";
  const memberName = data?.memberName || null;
  const tableName = data?.tableName || null;
  const date = data?.createdAt
    ? new Date(data.createdAt).toLocaleString("id-ID")
    : new Date().toLocaleString("id-ID");

  const handleSendWA = async () => {
    if (!waPhone.trim()) return;
    setSending(true);
    try {
      const res = await sendInvoiceWA({
        invoice: invoiceNumber,
        phone: waPhone,
        store: data?.store,
        total: subtotal
      });
      if (res?.data?.waLink) {
        window.open(res.data.waLink, "_blank");
        toast?.success?.(t("page.cashier.receipt.toast.waSuccess"));
      } else {
        toast?.error?.(t("page.cashier.receipt.toast.waError"));
      }
      setShowSendWA(false);
    } catch (err) {
      toast?.error?.(err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.waError"));
    }
    setSending(false);
  };

  const handleSendEmail = async () => {
    if (!emailAddr.trim()) return;
    setSending(true);
    try {
      await sendInvoiceEmail({
        invoice: invoiceNumber,
        email: emailAddr,
        store: data?.store,
        total: subtotal
      });
      toast?.success?.(t("page.cashier.receipt.toast.emailSuccess"));
      setShowSendEmail(false);
    } catch (err) {
      toast?.error?.(err?.message || t("page.cashier.receipt.toast.emailError"));
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">{t("page.cashier.receipt.title")}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center border-b border-dashed border-border pb-4">
            <Receipt size={32} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{t("page.cashier.receipt.paymentSuccess")}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("page.cashier.receipt.invoiceNumber")}
            </p>
            <p className="text-sm font-bold tracking-wider">{invoiceNumber}</p>
          </div>

          {memberName && (
            <div className="text-center -mt-2">
              <p className="text-xs text-muted-foreground">{t("page.cashier.receipt.member")}</p>
              <p className="text-sm font-medium">{memberName}</p>
            </div>
          )}

          {tableName && (
            <div className="text-center -mt-2">
              <p className="text-xs text-muted-foreground">{t("page.cashier.receipt.table")}</p>
              <p className="text-sm font-medium">{tableName}</p>
            </div>
          )}

          <div className="border-t border-dashed border-border pt-3 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count}x @ {formatCurrencyRupiah(item.price)}
                  </p>
                </div>
                <span className="font-medium ml-2">
                  {formatCurrencyRupiah(item.totalPrice || item.count * item.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("page.cashier.receipt.subtotal")}</span>
              <span>{formatCurrencyRupiah(subtotal)}</span>
            </div>
            {serviceCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Layanan (5%)</span>
                <span>{formatCurrencyRupiah(serviceCharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("page.cashier.receipt.paymentMethod")}
              </span>
              <span>{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("page.cashier.receipt.paid")}</span>
              <span>{formatCurrencyRupiah(paid)}</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("page.cashier.change")}</span>
                <span className="text-green-600 font-medium">{formatCurrencyRupiah(change)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
              <span>{t("page.cashier.total")}</span>
              <span className="text-primary">{formatCurrencyRupiah(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowSendWA(true)}>
              <Send size={14} className="mr-1.5" />
              {t("page.cashier.receipt.sendWA")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowSendEmail(true)}>
              <Mail size={14} className="mr-1.5" />
              {t("page.cashier.receipt.sendEmail")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Printer size={14} className="mr-1.5" />
              {t("common.print")}
            </Button>
          </div>
          <Button className="w-full" onClick={onNewTransaction}>
            {t("page.cashier.receipt.newTransaction")}
          </Button>
        </div>
      </div>

      {showSendWA && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm p-5 space-y-4">
            <h4 className="font-semibold">{t("page.cashier.receipt.sendWATitle")}</h4>
            <Input
              placeholder={t("page.cashier.receipt.phonePlaceholder")}
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendWA(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSendWA} disabled={!waPhone.trim() || sending}>
                {sending ? t("page.cashier.receipt.sending") : t("page.cashier.receipt.send")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSendEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-sm p-5 space-y-4">
            <h4 className="font-semibold">{t("page.cashier.receipt.sendEmailTitle")}</h4>
            <Input
              placeholder={t("page.cashier.receipt.emailPlaceholder")}
              type="email"
              value={emailAddr}
              onChange={(e) => setEmailAddr(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendEmail(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSendEmail} disabled={!emailAddr.trim() || sending}>
                {sending ? t("page.cashier.receipt.sending") : t("page.cashier.receipt.send")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptModal;
