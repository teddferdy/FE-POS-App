/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { X, Printer, Send, Mail, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatCurrencyRupiah } from "@/utils/formatter-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendInvoiceWA,
  sendInvoiceEmail,
  getWhatsAppStatus,
  restartWhatsApp
} from "@/services/invoice";
import { printViaBrowser } from "@/utils/thermalPrint";

const receiptItem = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: "spring", damping: 25, stiffness: 300 }
  })
};

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const [showSendWA, setShowSendWA] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [waPhone, setWaPhone] = useState(data?.memberPhone || data?.phoneNumber || "");
  const [emailAddr, setEmailAddr] = useState(data?.memberEmail || data?.email || "");
  const [sending, setSending] = useState(false);
  const [waStatus, setWaStatus] = useState(null);
  const [waChecking, setWaChecking] = useState(false);

  const invoiceNumber =
    data?.invoice || data?.invoiceNumber || data?.orderNumber || data?.noInvoice || "-";
  const items = data?.items || [];
  const rawSubtotal = data?.rawSubtotal || data?.subTotal || 0;
  const serviceCharge = data?.serviceCharge || 0;
  const discountAmount = data?.discountAmount || 0;
  const total = data?.totalPrice || data?.total || data?.subtotal || rawSubtotal;
  const paid = data?.paid || total;
  const change = data?.change || 0;
  const paymentMethod = data?.paymentMethod || "Cash";
  const memberName = data?.memberName || null;
  const tableName = data?.tableName || null;
  const cashierName = data?.cashierName || data?.cashier || "";
  const storeName = data?.storeName || "Toko";
  const date = data?.createdAt
    ? new Date(data.createdAt).toLocaleString("id-ID")
    : new Date().toLocaleString("id-ID");

  const handleOpenWA = async () => {
    setShowSendWA(true);
    setWaChecking(true);
    try {
      const res = await getWhatsAppStatus();
      setWaStatus(res?.data || null);
    } catch {
      setWaStatus(null);
    }
    setWaChecking(false);
  };

  const handleRecheckWA = async () => {
    setWaChecking(true);
    try {
      const cur = await getWhatsAppStatus();
      // If client has session info but not ready and no QR, force restart
      if (!cur?.data?.ready && !cur?.data?.hasQR && cur?.data?.phoneNumber) {
        await restartWhatsApp();
        // Wait a moment then check status
        await new Promise((r) => setTimeout(r, 3000));
        const res = await getWhatsAppStatus();
        setWaStatus(res?.data || null);
      } else {
        setWaStatus(cur?.data || null);
      }
    } catch {
      setWaStatus(null);
    }
    setWaChecking(false);
  };

  const handleSendWA = async () => {
    if (!waPhone.trim()) return;
    setSending(true);
    try {
      const res = await sendInvoiceWA({
        orderId: data?.id,
        phone: waPhone
      });
      if (res?.success) {
        toast?.success?.(t("page.cashier.receipt.toast.waSuccess"));
        setShowSendWA(false);
      } else {
        toast?.error?.(res?.message || t("page.cashier.receipt.toast.waError"));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.waError");
      toast?.error?.(msg);
    }
    setSending(false);
  };

  const handleSendEmail = async () => {
    if (!emailAddr.trim()) return;
    setSending(true);
    try {
      await sendInvoiceEmail({
        orderId: data?.id,
        email: emailAddr
      });
      toast?.success?.(t("page.cashier.receipt.toast.emailSuccess"));
      setShowSendEmail(false);
    } catch (err) {
      toast?.error?.(err?.message || t("page.cashier.receipt.toast.emailError"));
    }
    setSending(false);
  };

  const handlePrint = () => {
    printViaBrowser({
      storeName,
      orderNumber: invoiceNumber,
      cashier: cashierName,
      customer: memberName || "Umum",
      date: new Date().toLocaleString("id-ID"),
      items: items.map((i) => ({
        name: i.name || i.productName,
        qty: i.count || i.quantity,
        price: i.price,
        total: i.totalPrice || i.total || i.price * (i.count || i.quantity)
      })),
      subtotal: rawSubtotal,
      discount: discountAmount,
      serviceCharge: serviceCharge,
      tax: 0,
      total,
      paymentMethod,
      cashAmount: paid,
      changeAmount: change,
      footer: "Terima kasih atas kunjungan Anda"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-lg max-h-[96vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-card/50">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
            {t("page.cashier.receipt.title")}
          </h3>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-accent/50 transition-colors flex items-center justify-center">
            <X size={16} />
          </motion.button>
        </div>

        <div className="p-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center border-b border-dashed border-border/50 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mx-auto mb-2 border border-green-500/20">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <p className="text-lg font-bold flex items-center justify-center gap-1.5">
              {t("page.cashier.receipt.paymentSuccess")}
              <Sparkles size={16} className="text-amber-500" />
            </p>
            <p className="text-sm text-muted-foreground/70">{date}</p>
          </motion.div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
              {t("page.cashier.receipt.invoiceNumber")}
            </p>
            <p className="text-sm font-bold tracking-wider text-foreground/90">{invoiceNumber}</p>
          </div>

          {memberName && (
            <div className="text-center -mt-2">
              <p className="text-xs text-muted-foreground/60">{t("page.cashier.receipt.member")}</p>
              <p className="text-sm font-medium text-foreground/80">{memberName}</p>
            </div>
          )}

          {tableName && (
            <div className="text-center -mt-2">
              <p className="text-xs text-muted-foreground/60">{t("page.cashier.receipt.table")}</p>
              <p className="text-sm font-medium text-foreground/80">{tableName}</p>
            </div>
          )}

          <div className="border-t border-dashed border-border/50 pt-3 space-y-2">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  custom={idx}
                  variants={receiptItem}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground/90 font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {item.count}x @ {formatCurrencyRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-medium ml-2 text-foreground/80">
                    {formatCurrencyRupiah(item.totalPrice || item.count * item.price)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-dashed border-border/50 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/70">{t("page.cashier.receipt.subtotal")}</span>
              <span className="text-foreground/80">{formatCurrencyRupiah(rawSubtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground/70">
                  {t("page.cashier.receipt.discount")}
                </span>
                <span className="text-red-500 font-medium">
                  -{formatCurrencyRupiah(discountAmount)}
                </span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground/70">
                  {t("page.cashier.modal.serviceCharge")}
                </span>
                <span className="text-foreground/80">{formatCurrencyRupiah(serviceCharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/70">
                {t("page.cashier.receipt.paymentMethod")}
              </span>
              <span className="text-foreground/80">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/70">{t("page.cashier.receipt.paid")}</span>
              <span className="text-foreground/80">{formatCurrencyRupiah(paid)}</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground/70">{t("page.cashier.change")}</span>
                <span className="text-green-500 font-medium">{formatCurrencyRupiah(change)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-border/50 pt-2 mt-2">
              <span className="text-foreground/90">{t("page.cashier.receipt.total")}</span>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrencyRupiah(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/50 flex flex-col gap-2 bg-card/50">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenWA}
              className="flex-1 h-9 text-sm font-medium rounded-xl border border-border/50 hover:bg-accent/50 transition-all flex items-center justify-center gap-1.5">
              <Send size={14} className="text-green-500" />
              {t("page.cashier.receipt.sendWA")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSendEmail(true)}
              className="flex-1 h-9 text-sm font-medium rounded-xl border border-border/50 hover:bg-accent/50 transition-all flex items-center justify-center gap-1.5">
              <Mail size={14} className="text-blue-500" />
              {t("page.cashier.receipt.sendEmail")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="flex-1 h-9 text-sm font-medium rounded-xl border border-border/50 hover:bg-accent/50 transition-all flex items-center justify-center gap-1.5">
              <Printer size={14} className="text-muted-foreground" />
              {t("common.print")}
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onNewTransaction}
            className="w-full h-10 text-sm font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all">
            {t("page.cashier.receipt.newTransaction")}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSendWA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm p-5 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Send size={16} className="text-green-500" />
                {t("page.cashier.receipt.sendWATitle")}
              </h4>

              <Input
                placeholder={t("page.cashier.receipt.phonePlaceholder")}
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                className="bg-muted/30 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
              />

              {waStatus && !waStatus?.ready && (
                <div className="text-center space-y-2 py-2 border-t border-border/50">
                  <p className="text-xs font-medium text-destructive/80">
                    {t("page.cashier.receipt.waNotConnected")}
                  </p>
                  {waStatus?.error && (
                    <p className="text-[11px] text-destructive/60">{waStatus.error}</p>
                  )}
                  {waStatus?.qrBase64 ? (
                    <>
                      <p className="text-[11px] text-muted-foreground/70">
                        {t("page.cashier.receipt.waScanQr")}
                      </p>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center mt-1">
                        <img
                          src={waStatus.qrBase64}
                          alt="WhatsApp QR Code"
                          className="w-40 h-40 border border-border/50 rounded-xl bg-white p-1"
                        />
                      </motion.div>
                    </>
                  ) : (
                    !waStatus?.error && (
                      <p className="text-[11px] text-muted-foreground/70">
                        {t("page.cashier.receipt.sending")}
                      </p>
                    )
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRecheckWA}
                    disabled={waChecking}
                    className="px-4 py-1.5 text-xs font-medium rounded-xl border border-border/50 hover:bg-accent/50 transition-all">
                    {waChecking
                      ? t("page.cashier.receipt.sending")
                      : t("page.cashier.receipt.waRetry")}
                  </motion.button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowSendWA(false)}
                  className="rounded-xl border-border/50">
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSendWA}
                  disabled={!waPhone.trim() || sending}
                  className="rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/20">
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {t("page.cashier.receipt.sending")}
                    </span>
                  ) : (
                    t("page.cashier.receipt.send")
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSendEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm p-5 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                {t("page.cashier.receipt.sendEmailTitle")}
              </h4>
              <Input
                placeholder={t("page.cashier.receipt.emailPlaceholder")}
                type="email"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                className="bg-muted/30 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowSendEmail(false)}
                  className="rounded-xl border-border/50">
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={!emailAddr.trim() || sending}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20">
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {t("page.cashier.receipt.sending")}
                    </span>
                  ) : (
                    t("page.cashier.receipt.send")
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReceiptModal;
