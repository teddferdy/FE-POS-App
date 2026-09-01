import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, Printer, RotateCcw, CheckCircle, Users, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSplitBill } from "@/services/split-bill";
import { getInvoiceSetting } from "@/services/invoice";
import { getLocationById } from "@/services/location";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalCode
} from "@/services/general";
import { toast } from "sonner";
import { printReceipt } from "@/utils/thermalPrint";

const ReceiptModal = ({ data, onClose, onNewTransaction }) => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const [thermalLoading, setThermalLoading] = useState(false);
  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return "0";
    return Number(value).toLocaleString("id-ID");
  };

  const user = cookie?.user;
  const storeId =
    cookie?.activeStore || user?.store || data?.storeId || data?.location || data?.store || "";

  const { data: invoiceSettings } = useQuery(
    ["invoice-settings", storeId],
    () => getInvoiceSetting(storeId),
    { enabled: !!storeId }
  );
  const settingsData = invoiceSettings?.data || null;

  const [paperSize, setPaperSize] = useState(settingsData?.paperSize || "58mm");

  React.useEffect(() => {
    if (settingsData?.paperSize) {
      setPaperSize(settingsData.paperSize);
    }
  }, [settingsData?.paperSize]);

  const { data: storeData } = useQuery(
    ["store-detail", storeId],
    () => getLocationById({ id: storeId }),
    { enabled: !!storeId }
  );
  const locationDetail = storeData?.data || storeData || null;

  const { data: provinces } = useQuery(["provinces"], getProvinces, {
    enabled: !!locationDetail?.province && !locationDetail?.provinceName
  });
  const { data: cities } = useQuery(
    ["cities", locationDetail?.province],
    () => getCities(locationDetail.province),
    { enabled: !!locationDetail?.province && !locationDetail?.cityName }
  );
  const { data: districts } = useQuery(
    ["districts", locationDetail?.city],
    () => getDistricts(locationDetail.city),
    { enabled: !!locationDetail?.city && !locationDetail?.districtName }
  );
  const { data: villages } = useQuery(
    ["villages", locationDetail?.district],
    () => getVillages(locationDetail.district),
    { enabled: !!locationDetail?.district && !locationDetail?.villageName }
  );
  const { data: postalCodes } = useQuery(
    ["postal-codes", locationDetail?.village],
    () => getPostalCode(locationDetail.village),
    { enabled: !!locationDetail?.village && !locationDetail?.postalCode }
  );

  const showLogo = settingsData?.showLogo ?? true;
  const showStoreName = settingsData?.showStoreName ?? true;
  const showAddress = settingsData?.showAddress ?? true;
  const showMemberInfo = settingsData?.showMemberInfo ?? true;
  const showSocialMedia = settingsData?.showSocialMedia ?? true;
  const addressFieldsVisible = (() => {
    const raw = settingsData?.addressFieldsVisibility;
    if (!raw) return {};
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  })();

  const storeName =
    locationDetail?.name ||
    locationDetail?.storeName ||
    data?.storeName ||
    data?.outlet ||
    t("page.cashier.receipt.storeFallback");
  const locationAddress =
    locationDetail?.address ||
    locationDetail?.locationAddress ||
    data?.storeAddress ||
    data?.outletAddress ||
    "";
  const locationDetailAddress =
    locationDetail?.detailLocation || locationDetail?.locationDetail || "";
  const provinceName =
    locationDetail?.provinceName ||
    provinces?.find((p) => p.kode_prov === locationDetail?.province)?.nama_provinsi ||
    locationDetail?.province ||
    "";
  const cityName =
    locationDetail?.cityName ||
    cities?.find((c) => c.kode_kab === locationDetail?.city)?.nama_kabupaten ||
    locationDetail?.city ||
    "";
  const districtName =
    locationDetail?.districtName ||
    districts?.find((d) => d.kode_kec === locationDetail?.district)?.nama_kecamatan ||
    locationDetail?.district ||
    "";
  const villageName =
    locationDetail?.villageName ||
    villages?.find((v) => v.kode_desa === locationDetail?.village)?.nama_desa ||
    locationDetail?.village ||
    "";
  const postalCodeValue =
    locationDetail?.postalCode ||
    postalCodes?.[0]?.kode_pos ||
    "";
  const storePhone =
    locationDetail?.phoneNumber || locationDetail?.phone || data?.storePhone || data?.phone || "";
  const storeEmail = locationDetail?.email || data?.storeEmail || data?.email || "";

  const buildStoreAddress = () => {
    const parts = [];
    if (addressFieldsVisible.address !== false && locationAddress) parts.push(locationAddress);
    if (addressFieldsVisible.locationDetail !== false && locationDetailAddress)
      parts.push(locationDetailAddress);
    
    const regionParts = [];
    if (addressFieldsVisible.province !== false && provinceName) regionParts.push(provinceName);
    if (addressFieldsVisible.city !== false && cityName) regionParts.push(cityName);
    if (addressFieldsVisible.district !== false && districtName) regionParts.push(districtName);
    if (addressFieldsVisible.village !== false && villageName) regionParts.push(villageName);
    if (regionParts.length > 0) parts.push(regionParts.join(", "));

    if (addressFieldsVisible.postalCode !== false && postalCodeValue) parts.push(`Kode Pos: ${postalCodeValue}`);
    return parts.join(", ");
  };
  const storeAddress = buildStoreAddress();

  const socialMedia = locationDetail?.socialMedia || data?.socialMedia || [];
  const footerText = settingsData?.footer || data?.footer || t("page.cashier.receipt.thanks");
  const orderNumber =
    data?.orderNumber ||
    data?.invoice ||
    data?.transactionNumber ||
    `#INV-${Date.now().toString().slice(-6)}`;
  const orderId = data?.id || data?._id;
  const transactionDate = data?.createdAt || data?.date || new Date().toISOString();
  const formattedDate = new Date(transactionDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const cashierName = data?.cashierName || data?.cashier || "-";
  const customerName = data?.customerName || data?.customer?.name || "-";
  const paymentMethod = data?.paymentMethod || data?.payment?.method || "-";
  const items = data?.items || data?.orderItems || [];
  const subtotal = data?.subtotal || data?.amount || data?.total || 0;
  const tax = data?.tax || data?.taxAmount || 0;
  const taxRatePercent = (() => {
    if (data?.taxRate == null) {
      return tax > 0 ? Math.round((tax / Math.max(subtotal || 1, 1)) * 100) : 0;
    }
    const r = Number(data.taxRate);
    return r > 1 ? Math.round(r) : Math.round(r * 100);
  })();
  const discount = data?.discountValue || data?.discount || 0;
  const total = data?.total || data?.grandTotal || 0;
  const cashAmount = data?.cashAmount || data?.payment?.cashAmount || 0;
  const changeAmount = data?.changeAmount || data?.payment?.changeAmount || 0;

  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  // ponytail: simple equal-split default, manual override per person
  const [splitAmounts, setSplitAmounts] = useState(() =>
    Array.from({ length: 2 }, (_, i) => (i === 0 ? Math.ceil(total / 2) : Math.floor(total / 2)))
  );

  const splitMutation = useMutation({
    mutationFn: (payload) => createSplitBill(payload),
    onSuccess: () => {
      toast.success(t("page.cashier.receipt.toast.splitSuccess"));
      setShowSplit(false);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || t("page.cashier.receipt.toast.splitFailed")
      );
    }
  });

  const handleSplitCountChange = (n) => {
    const count = Math.max(2, Math.min(20, Number(n) || 2));
    setSplitCount(count);
    const base = Math.floor(total / count);
    const remainder = total - base * count;
    setSplitAmounts(Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base)));
  };

  const handleSplitAmountChange = (idx, val) => {
    setSplitAmounts(splitAmounts.map((amt, i) => (i === idx ? Number(val) || 0 : amt)));
  };

  const handleSplitSubmit = () => {
    const sum = splitAmounts.reduce((s, a) => s + a, 0);
    if (sum !== total) {
      toast.error(
        t("page.cashier.receipt.toast.splitSumError", {
          sum: formatPrice(sum),
          total: formatPrice(total)
        })
      );
      return;
    }
    if (!orderId) {
      toast.error(t("page.cashier.receipt.toast.orderNotFound"));
      return;
    }
    splitMutation.mutate({
      order: orderId,
      items: splitAmounts.map((amount) => ({ amount }))
    });
  };

  const handleThermalPrint = async () => {
    setThermalLoading(true);
    try {
      const receipt = {
        storeName,
        storeAddress,
        storePhone,
        storeEmail,
        logo: settingsData?.logo || "",
        memberName: data?.customerName || data?.customer?.name || "",
        memberTier: data?.customer?.memberTier || data?.customer?.tier || "",
        memberPoints:
          data?.customer?.memberPoints ||
          data?.customer?.totalPoints ||
          data?.customer?.points ||
          0,
        orderNumber,
        cashier: cashierName,
        date: transactionDate,
        items: items.map((i) => ({
          name: i.nameProduct || i.name || "-",
          qty: i.count || i.qty || 0,
          price: i.price || 0,
          total: i.totalPrice || i.price * (i.count || 1) || 0,
          options: i.options || (i.variantName ? [{ name: i.variantName }] : [])
        })),
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        cashAmount,
        changeAmount,
        socialMedia,
        footer: footerText,
        showLogo,
        showStoreName,
        showAddress,
        showMemberInfo,
        showSocialMedia,
        socialMediaVisibility: settingsData?.socialMediaVisibility,
        addressFieldsVisibility: addressFieldsVisible,
        paperSize,
        fontSize: settingsData?.fontSize || "normal",
        fontFamily: settingsData?.fontFamily || "monospace",
        lineSpacing: settingsData?.lineSpacing || "normal"
      };
      await printReceipt(receipt, "auto");
      toast.success(t("page.cashier.receipt.toast.printSuccess"));
    } catch (err) {
      if (err.name !== "NotFoundError") {
        toast.error(err?.message || t("page.cashier.receipt.toast.printError"));
      }
    } finally {
      setThermalLoading(false);
    }
  };

  const fontSize = settingsData?.fontSize || "normal";
  const fontFamily = settingsData?.fontFamily || "monospace";
  const lineSpacing = settingsData?.lineSpacing || "normal";

  const fontFamClass =
    fontFamily === "sans"
      ? "font-sans"
      : fontFamily === "serif"
      ? "font-serif"
      : "font-mono";

  const sizeClasses = {
    small: {
      title: "text-base font-bold tracking-tight",
      address: "text-[10px]",
      memberHeader: "text-[9px]",
      memberText: "text-[10px]",
      memberName: "text-[11px] font-semibold",
      metaOrder: "text-xs",
      metaText: "text-[10px]",
      tableTh: "text-[9px]",
      tableItem: "text-xs",
      tableSub: "text-[9px]",
      totalsLabel: "text-xs",
      totalsValue: "text-xs font-medium",
      totalsGrand: "text-sm font-bold",
      footer: "text-[10px]",
      social: "text-[9px]"
    },
    normal: {
      title: "text-lg font-bold tracking-tight",
      address: "text-[11px]",
      memberHeader: "text-[10px]",
      memberText: "text-[11px]",
      memberName: "text-xs font-semibold",
      metaOrder: "text-sm",
      metaText: "text-[11px]",
      tableTh: "text-[10px]",
      tableItem: "text-sm",
      tableSub: "text-[10px]",
      totalsLabel: "text-sm",
      totalsValue: "text-sm font-medium",
      totalsGrand: "text-base font-bold",
      footer: "text-xs",
      social: "text-[10px]"
    },
    large: {
      title: "text-xl font-bold tracking-tight",
      address: "text-xs",
      memberHeader: "text-xs",
      memberText: "text-xs",
      memberName: "text-sm font-semibold",
      metaOrder: "text-base",
      metaText: "text-xs",
      tableTh: "text-xs",
      tableItem: "text-base",
      tableSub: "text-xs",
      totalsLabel: "text-base",
      totalsValue: "text-base font-medium",
      totalsGrand: "text-lg font-bold",
      footer: "text-sm",
      social: "text-xs"
    }
  };
  const sz = sizeClasses[fontSize] || sizeClasses.normal;

  const padClasses = {
    compact: {
      header: "px-4 py-4",
      section: "px-4 py-2",
      tablePy: "py-1",
      totals: "p-2 space-y-1",
      footer: "px-4 py-2"
    },
    normal: {
      header: "px-5 py-6",
      section: "px-5 py-3",
      tablePy: "py-2",
      totals: "p-3 space-y-2",
      footer: "px-5 py-3"
    },
    relaxed: {
      header: "px-6 py-7",
      section: "px-6 py-4",
      tablePy: "py-3",
      totals: "p-4 space-y-3",
      footer: "px-6 py-4"
    }
  };
  const pd = padClasses[lineSpacing] || padClasses.normal;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border/50 w-[80vw] max-w-none max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold">{t("page.cashier.receipt.title")}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Paper Size selector */}
            <div className="flex items-center bg-muted p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPaperSize("58mm")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paperSize === "58mm"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("80mm")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  paperSize === "80mm"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                80mm
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* InvoicePreview-style receipt */}
          <div
            className={`bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 mx-auto overflow-hidden transition-all duration-200 ${fontFamClass} ${
              paperSize === "80mm" ? "max-w-[420px]" : "max-w-[320px]"
            }`}>
            {/* Dark header — store name, logo, address */}
            <div className={`bg-gradient-to-br from-gray-900 to-gray-800 ${pd.header} text-white text-center`}>
              {showLogo && settingsData?.logo && (
                <img
                  src={settingsData.logo}
                  alt="Logo"
                  className="h-16 w-16 object-contain bg-white rounded-lg p-1 mx-auto mb-3"
                />
              )}
              {showStoreName && <h3 className={sz.title}>{storeName}</h3>}
              {showAddress && (
                <div className="text-gray-400 mt-2 space-y-0.5">
                  {addressFieldsVisible.address !== false && locationAddress && (
                    <p className={sz.address}>{locationAddress}</p>
                  )}
                  {addressFieldsVisible.locationDetail !== false && locationDetailAddress && (
                    <p className={sz.address}>{locationDetailAddress}</p>
                  )}
                  {((addressFieldsVisible.province !== false && provinceName) ||
                    (addressFieldsVisible.city !== false && cityName) ||
                    (addressFieldsVisible.district !== false && districtName) ||
                    (addressFieldsVisible.village !== false && villageName)) && (
                    <p className={sz.address}>
                      {[
                        addressFieldsVisible.province !== false && provinceName ? provinceName : "",
                        addressFieldsVisible.city !== false && cityName ? cityName : "",
                        addressFieldsVisible.district !== false && districtName ? districtName : "",
                        addressFieldsVisible.village !== false && villageName ? villageName : ""
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {addressFieldsVisible.postalCode !== false && postalCodeValue && (
                    <p className={sz.address}>Kode Pos: {postalCodeValue}</p>
                  )}
                  {addressFieldsVisible.phone !== false && storePhone && (
                    <p className={sz.address}>Telp: {storePhone}</p>
                  )}
                  {addressFieldsVisible.email !== false && storeEmail && (
                    <p className={sz.address}>{storeEmail}</p>
                  )}
                </div>
              )}
            </div>

            {/* Transaction meta */}
            <div className={`${pd.section} border-b border-gray-200 space-y-1`}>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <p className={`${sz.metaText} font-semibold text-emerald-600`}>
                  {t("page.cashier.receipt.paymentSuccess")}
                </p>
              </div>
              <p className={`text-center font-bold tracking-wide text-gray-800 ${sz.metaOrder}`}>
                {orderNumber}
              </p>
              <p className={`text-center text-gray-500 ${sz.metaText}`}>{formattedDate}</p>
              <div className={`flex justify-between text-gray-600 pt-1 ${sz.metaText}`}>
                <span>
                  {t("page.cashier.receipt.cashier")}:{" "}
                  <span className="font-medium">{cashierName}</span>
                </span>
                <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>

            {/* Member info band */}
            {showMemberInfo && (customerName !== "-" || data?.customer?.memberTier) && (
              <div className={`${pd.section} bg-yellow-50 border-b border-yellow-100`}>
                <p className={`${sz.memberHeader} font-semibold text-yellow-800 uppercase tracking-wider mb-2`}>
                  {t("page.invoice.memberInfo")}
                </p>
                <div className="space-y-1">
                  {customerName && customerName !== "-" && (
                    <div className="flex justify-between items-center">
                      <span className={`${sz.memberText} text-yellow-900 font-medium`}>
                        {t("page.invoice.memberName")}
                      </span>
                      <span className={`${sz.memberName} text-yellow-800`}>{customerName}</span>
                    </div>
                  )}
                  {data?.customer?.memberTier && (
                    <div className="flex justify-between items-center">
                      <span className={`${sz.memberText} text-yellow-900 font-medium`}>
                        {t("page.invoice.memberTier")}
                      </span>
                      <span className={`${sz.memberName} text-yellow-800`}>
                        {data.customer.memberTier}
                      </span>
                    </div>
                  )}
                  {data?.customer?.memberPoints != null && (
                    <div className="flex justify-between items-center">
                      <span className={`${sz.memberText} text-yellow-900 font-medium`}>
                        {t("page.invoice.totalPoints")}
                      </span>
                      <span className={`${sz.memberName} text-yellow-800`}>
                        {Number(data.customer.memberPoints).toLocaleString("id-ID")} pts
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items table */}
            <div className={pd.section}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${sz.tableTh} text-gray-500 uppercase tracking-wider border-b border-gray-200`}>
                      <th className={`text-left ${pd.tablePy} font-semibold`}>{t("page.invoice.item")}</th>
                      <th className={`text-center ${pd.tablePy} font-semibold w-10`}>Qty</th>
                      <th className={`text-right ${pd.tablePy} font-semibold`}>Harga</th>
                      <th className={`text-right ${pd.tablePy} font-semibold`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className={`${pd.tablePy} ${sz.tableItem} text-gray-800`}>
                            <span>{item.nameProduct || item.name || "-"}</span>
                            {item.options?.[0]?.name && (
                              <span className={`block text-gray-400 ${sz.tableSub}`}>
                                – {item.options[0].name}
                              </span>
                            )}
                          </td>
                          <td className={`${pd.tablePy} text-center ${sz.tableItem} text-gray-600`}>
                            {item.count || item.qty || 0}
                          </td>
                          <td className={`${pd.tablePy} text-right ${sz.tableItem} text-gray-600`}>
                            Rp{formatPrice(item.price || 0)}
                          </td>
                          <td className={`${pd.tablePy} text-right ${sz.tableItem} font-medium text-gray-900`}>
                            Rp{formatPrice(item.totalPrice || item.price * (item.count || 1) || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-sm text-gray-400">
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary card */}
            <div className={pd.section}>
              <div className={`bg-gray-50 rounded-lg ${pd.totals}`}>
                <div className="flex justify-between">
                  <span className={`text-gray-500 ${sz.totalsLabel}`}>{t("page.invoice.subtotal")}</span>
                  <span className={`text-gray-700 ${sz.totalsValue}`}>Rp{formatPrice(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-gray-500 ${sz.totalsLabel}`}>
                      {t("page.cashier.tax")} ({taxRatePercent}%)
                    </span>
                    <span className={`text-gray-700 ${sz.totalsValue}`}>Rp{formatPrice(tax)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-emerald-600 ${sz.totalsLabel}`}>{t("page.cashier.discount")}</span>
                    <span className={`text-emerald-600 ${sz.totalsValue}`}>-Rp{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className={`text-gray-900 ${sz.totalsGrand}`}>
                    {t("page.invoice.total")}
                  </span>
                  <span className={`text-gray-900 ${sz.totalsGrand}`}>Rp{formatPrice(total)}</span>
                </div>
                {(paymentMethod === "cash" || paymentMethod?.toLowerCase() === "cash") && (
                  <>
                    <div className="flex justify-between">
                      <span className={`text-gray-500 ${sz.totalsLabel}`}>{t("page.cashier.cashAmount")}</span>
                      <span className={`text-gray-700 ${sz.totalsValue}`}>Rp{formatPrice(cashAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-gray-500 ${sz.totalsLabel}`}>{t("page.cashier.change")}</span>
                      <span className={`text-emerald-600 font-semibold ${sz.totalsValue}`}>
                        Rp{formatPrice(changeAmount)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`bg-gray-50 ${pd.footer} border-t border-gray-200`}>
              <p
                className={`text-center text-gray-400 ${sz.footer} italic overflow-hidden`}
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 4,
                  textOverflow: "ellipsis"
                }}>
                {footerText}
              </p>
              {showSocialMedia && socialMedia.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-gray-200 flex-wrap">
                  {socialMedia.map((sm, idx) => (
                    <span key={idx} className={`text-gray-400 ${sz.social}`}>
                      {typeof sm === "string"
                        ? sm
                        : `${sm.platform || sm.name || ""}: ${sm.account || sm.username || sm.url || ""}`.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 p-4 shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border/60"
              onClick={handleThermalPrint}
              loading={thermalLoading}>
              <Printer size={16} />
              {t("page.cashier.receipt.thermal")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border/60"
              onClick={() => {
                setSplitCount(2);
                const base = Math.floor(total / 2);
                setSplitAmounts([total - base, base]);
                setShowSplit(true);
              }}>
              <Users size={16} />
              {t("page.cashier.receipt.split")}
            </Button>
            <Button
              onClick={onNewTransaction}
              className="flex-1 h-11 rounded-xl relative overflow-hidden group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/90 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <RotateCcw size={16} />
                {t("page.cashier.receipt.newTransaction")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {showSplit && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl border border-border/50 w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <h3 className="font-bold">{t("page.cashier.receipt.splitTitle")}</h3>
              </div>
              <button
                onClick={() => setShowSplit(false)}
                className="p-1 rounded-lg hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("page.cashier.receipt.splitPeople")}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleSplitCountChange(splitCount - 1)}>
                    <Plus size={14} className="rotate-45" />
                  </Button>
                  <span className="w-8 text-center font-bold">{splitCount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleSplitCountChange(splitCount + 1)}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {splitAmounts.map((amount, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleSplitAmountChange(idx, e.target.value)}
                      className="flex-1"
                    />
                    {splitCount > 2 && (
                      <button
                        onClick={() => {
                          const next = splitAmounts.filter((_, i) => i !== idx);
                          setSplitAmounts(next);
                          setSplitCount(next.length);
                        }}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm font-medium pt-2 border-t border-border">
                <span>{t("page.cashier.total")}</span>
                <span
                  className={
                    splitAmounts.reduce((s, a) => s + a, 0) === total
                      ? "text-primary"
                      : "text-destructive"
                  }>
                  Rp {formatPrice(splitAmounts.reduce((s, a) => s + a, 0))}
                  {splitAmounts.reduce((s, a) => s + a, 0) !== total && (
                    <span className="text-xs ml-1">
                      ({t("page.cashier.receipt.splitMustEqual", { total: formatPrice(total) })})
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-border/50 p-4 shrink-0 flex items-center gap-2">
              <Button variant="danger" className="flex-1" onClick={() => setShowSplit(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={handleSplitSubmit}
                loading={splitMutation.isLoading}
                disabled={splitAmounts.reduce((s, a) => s + a, 0) !== total}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReceiptModal.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orderNumber: PropTypes.string,
    invoice: PropTypes.string,
    transactionNumber: PropTypes.string,
    createdAt: PropTypes.string,
    date: PropTypes.string,
    cashierName: PropTypes.string,
    cashier: PropTypes.string,
    customerName: PropTypes.string,
    customer: PropTypes.shape({ name: PropTypes.string }),
    paymentMethod: PropTypes.string,
    payment: PropTypes.shape({
      method: PropTypes.string,
      cashAmount: PropTypes.number,
      changeAmount: PropTypes.number
    }),
    items: PropTypes.array,
    orderItems: PropTypes.array,
    subtotal: PropTypes.number,
    amount: PropTypes.number,
    total: PropTypes.number,
    tax: PropTypes.number,
    taxAmount: PropTypes.number,
    discountValue: PropTypes.number,
    discount: PropTypes.number,
    grandTotal: PropTypes.number,
    cashAmount: PropTypes.number,
    changeAmount: PropTypes.number,
    storeName: PropTypes.string,
    storeAddress: PropTypes.string,
    storePhone: PropTypes.string,
    socialMedia: PropTypes.array
  }),
  onClose: PropTypes.func,
  onNewTransaction: PropTypes.func
};

export default ReceiptModal;
