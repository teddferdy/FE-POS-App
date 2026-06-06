/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
  Upload,
  Building2,
  Image,
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Hash,
  Globe,
  Store,
  Printer,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getInvoiceSetting, updateInvoiceSetting } from "@/services/invoice";
import { getLocationById } from "@/services/location";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalCode
} from "@/services/general";
import { printViaBrowser } from "@/utils/thermalPrint";

const sampleItems = [
  { name: "Nasi Goreng", qty: 2, price: 25000 },
  { name: "Es Teh Manis", qty: 1, price: 8000 },
  { name: "Ayam Bakar", qty: 1, price: 35000 }
];

const formatPrice = (val) => `Rp${Number(val).toLocaleString("id-ID")}`;

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value || "-"}</p>
    </div>
  </div>
);

const InvoicePreview = ({
  logo,
  storeName,
  storePhone,
  storeEmail,
  fullAddress,
  footer,
  socialMedia,
  cashierName,
  showLogo = true,
  showStoreName = true,
  showAddress = true,
  showFooter = true
}) => {
  const subtotal = sampleItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const showHeader = showLogo || showStoreName || showAddress;

  return (
    <div className="bg-white text-black rounded-xl shadow-sm border border-border p-5 max-w-sm mx-auto font-mono text-xs leading-relaxed select-all">
      {showHeader && (
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-3">
          {showLogo && logo && (
            <img src={logo} alt="logo" className="h-14 mx-auto mb-2 object-contain" />
          )}
          {showStoreName && (
            <h3 className="text-base font-bold uppercase tracking-tight text-gray-800">
              {storeName || "NAMA TOKO"}
            </h3>
          )}
          {showAddress && (
            <div className="text-gray-500 mt-1 space-y-0.5">
              {fullAddress && <p className="text-[11px]">{fullAddress}</p>}
              {storePhone && <p className="text-[11px]">Telp: {storePhone}</p>}
              {storeEmail && <p className="text-[11px]">{storeEmail}</p>}
            </div>
          )}
        </div>
      )}

      <div className="border-b border-dashed border-gray-300 pb-2 mb-3">
        <div className="flex justify-between text-gray-500 text-[10px]">
          <span>
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
          <span>
            {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex justify-between text-gray-500 text-[10px] mt-0.5">
          <span>Invoice: INV-{String(Date.now()).slice(-8)}</span>
          <span>Kasir: {cashierName || "Demo"}</span>
        </div>
      </div>

      <table className="w-full mb-3">
        <thead>
          <tr className="text-gray-600 text-[10px] border-b border-gray-300">
            <th className="text-left py-1 font-bold uppercase">Item</th>
            <th className="text-center py-1 font-bold uppercase">Qty</th>
            <th className="text-right py-1 font-bold uppercase">Harga</th>
            <th className="text-right py-1 font-bold uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {sampleItems.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5 text-gray-700">{item.name}</td>
              <td className="py-1.5 text-center text-gray-600">{item.qty}</td>
              <td className="py-1.5 text-right text-gray-600">{formatPrice(item.price)}</td>
              <td className="py-1.5 text-right text-gray-700 font-medium">
                {formatPrice(item.qty * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t-2 border-gray-300 pt-2 mb-3">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-700">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Pajak (10%)</span>
          <span className="text-gray-700">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-gray-300 mt-1.5">
          <span className="text-gray-800">Total</span>
          <span className="text-gray-900">{formatPrice(total)}</span>
        </div>
      </div>

      {showFooter && footer && (
        <div className="text-center text-gray-500 text-[10px] border-t border-dashed border-gray-300 pt-3 mb-2">
          {footer.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {socialMedia?.length > 0 && (
        <div className="text-center text-gray-400 text-[10px] border-t border-dashed border-gray-200 pt-2 mb-1">
          {socialMedia.map((s, i) => (
            <p key={i}>
              {s.platform}: {s.account}
            </p>
          ))}
        </div>
      )}

      <div className="text-center text-gray-400 text-[10px] mt-2 pt-2 border-t border-dashed border-gray-200 italic">
        Terima kasih atas kunjungan Anda
      </div>
    </div>
  );
};

const InvoicePage = () => {
  const { t } = useTranslation();
  const [cookie] = useCookies();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const user = cookie?.user;
  const storeName = cookie?.activeStoreName || user?.storeName || "Nama Toko";
  const store = user?.store || "";
  const cashierName = user?.userName || user?.name || user?.fullName || "";

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [footerText, setFooterText] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [showStoreName, setShowStoreName] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: storeData } = useQuery(
    ["store-detail", store],
    () => getLocationById({ id: store }),
    { enabled: !!store, staleTime: 5 * 60 * 1000 }
  );
  const locationDetail = storeData?.data || storeData || {};
  const storePhone = locationDetail?.phoneNumber || "";
  const storeEmail = locationDetail?.email || "";

  const { data: provinces } = useQuery(["provinces"], getProvinces, {
    enabled: !!locationDetail?.province,
    staleTime: 30 * 60 * 1000
  });
  const { data: cities } = useQuery(
    ["cities", locationDetail?.province],
    () => getCities(locationDetail.province),
    { enabled: !!locationDetail?.province, staleTime: 30 * 60 * 1000 }
  );
  const { data: districts } = useQuery(
    ["districts", locationDetail?.city],
    () => getDistricts(locationDetail.city),
    { enabled: !!locationDetail?.city, staleTime: 30 * 60 * 1000 }
  );
  const { data: villages } = useQuery(
    ["villages", locationDetail?.district],
    () => getVillages(locationDetail.district),
    { enabled: !!locationDetail?.district, staleTime: 30 * 60 * 1000 }
  );
  const { data: postalCodes } = useQuery(
    ["postal-codes", locationDetail?.village],
    () => getPostalCode(locationDetail.village),
    { enabled: !!locationDetail?.village, staleTime: 30 * 60 * 1000 }
  );

  const provinceName =
    provinces?.find((p) => p.kode_prov === locationDetail?.province)?.nama_provinsi ||
    locationDetail?.province ||
    "";
  const cityName =
    cities?.find((c) => c.kode_kab === locationDetail?.city)?.nama_kabupaten ||
    locationDetail?.city ||
    "";
  const districtName =
    districts?.find((d) => d.kode_kec === locationDetail?.district)?.nama_kecamatan ||
    locationDetail?.district ||
    "";
  const villageName =
    villages?.find((v) => v.kode_desa === locationDetail?.village)?.nama_desa ||
    locationDetail?.village ||
    "";
  const postalCodeValue = postalCodes?.[0]?.kode_pos || locationDetail?.postalCode || "";

  const fullAddress = [
    locationDetail?.address,
    locationDetail?.detailLocation,
    cityName,
    provinceName,
    postalCodeValue
  ]
    .filter(Boolean)
    .join(", ");

  const { data: invoiceSettings } = useQuery(
    ["invoice-settings", store],
    () => getInvoiceSetting(store),
    {
      enabled: !!store,
      staleTime: 5 * 60 * 1000
    }
  );

  const settingsData = invoiceSettings?.data || null;
  const settingsLogo = settingsData?.logoImage || null;
  const settingsFooter = settingsData?.footerText || "";

  const socialMedia = Array.isArray(settingsData?.socialMediaList)
    ? settingsData.socialMediaList
    : [];

  useEffect(() => {
    if (settingsData) {
      if (settingsData.logoImage) setLogoPreview(settingsData.logoImage);
      if (settingsData.footerText) setFooterText(settingsData.footerText);
      if (settingsData.showLogo !== undefined) setShowLogo(settingsData.showLogo);
      if (settingsData.showStoreName !== undefined) setShowStoreName(settingsData.showStoreName);
      if (settingsData.showAddress !== undefined) setShowAddress(settingsData.showAddress);
      if (settingsData.showFooter !== undefined) setShowFooter(settingsData.showFooter);
    }
  }, [settingsData]);

  const savedLogo = settingsLogo || logoPreview;

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("store", store);

      if (logoFile) {
        formData.append("image", logoFile);
      }

      formData.append("footerText", footerText);
      formData.append("showLogo", showLogo);
      formData.append("showStoreName", showStoreName);
      formData.append("showAddress", showAddress);
      formData.append("showFooter", showFooter);

      await updateInvoiceSetting(formData);
      toast.success("Pengaturan invoice berhasil disimpan");
      queryClient.invalidateQueries(["invoice-settings"]);
      setLogoFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPreview = () => {
    const items = sampleItems.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
      total: i.qty * i.price
    }));
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const addressParts = [];
    if (fullAddress) addressParts.push(fullAddress);
    if (storePhone) addressParts.push("Telp: " + storePhone);
    if (storeEmail) addressParts.push(storeEmail);

    printViaBrowser({
      storeName: showStoreName ? storeName || "Nama Toko" : "",
      storeAddress: showAddress ? addressParts.join(" | ") : "",
      storePhone: "",
      orderNumber: "INV-" + String(Date.now()).slice(-8),
      cashier: cashierName || "Demo",
      customer: "Umum",
      date: new Date().toLocaleString("id-ID"),
      items,
      subtotal,
      tax,
      total,
      paymentMethod: "Tunai",
      cashAmount: total,
      changeAmount: 0,
      footer: showFooter ? footerText || "Terima kasih atas kunjungan Anda" : ""
    });
  };

  return (
    <div data-tour="page-settings" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("page.invoice.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("page.invoice.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div data-tour="invoice-logo" className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Image size={18} className="text-primary" />
              <h3 className="text-base font-semibold">Logo & Header</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Nama Toko (Header)
                </label>
                <Input value={storeName} disabled className="bg-muted/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Logo Invoice
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center shrink-0">
                    {savedLogo ? (
                      <img src={savedLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={28} className="text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2">
                      <Upload size={14} />
                      {logoPreview && logoFile ? "Ganti Logo" : "Pilih Logo"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showLogo ? (
                      <Eye size={14} className="text-primary" />
                    ) : (
                      <EyeOff size={14} className="text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Tampilkan Logo</span>
                  </div>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showStoreName ? (
                      <Eye size={14} className="text-primary" />
                    ) : (
                      <EyeOff size={14} className="text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Tampilkan Nama Toko</span>
                  </div>
                  <Switch checked={showStoreName} onCheckedChange={setShowStoreName} />
                </div>
              </div>
            </div>
          </div>

          <div data-tour="invoice-address" className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <h3 className="text-base font-semibold">Alamat Toko</h3>
              </div>
              <div className="flex items-center gap-2">
                {showAddress ? (
                  <Eye size={14} className="text-primary" />
                ) : (
                  <EyeOff size={14} className="text-muted-foreground" />
                )}
                <Switch checked={showAddress} onCheckedChange={setShowAddress} />
              </div>
            </div>
            {store ? (
              <div className="divide-y divide-border">
                <DetailRow icon={Store} label="Nama Toko" value={storeName} />
                <DetailRow icon={MapPin} label="Alamat" value={locationDetail?.address} />
                {locationDetail?.detailLocation && (
                  <DetailRow
                    icon={Globe}
                    label="Detail Lokasi"
                    value={locationDetail.detailLocation}
                  />
                )}
                <DetailRow icon={Building2} label="Provinsi" value={provinceName} />
                <DetailRow icon={Building2} label="Kota/Kab" value={cityName} />
                <DetailRow icon={Building2} label="Kecamatan" value={districtName} />
                <DetailRow icon={Building2} label="Kelurahan" value={villageName} />
                <DetailRow icon={Hash} label="Kode Pos" value={postalCodeValue} />
                <DetailRow icon={Phone} label="Telepon" value={locationDetail?.phoneNumber} />
                <DetailRow icon={Mail} label="Email" value={locationDetail?.email} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Pilih lokasi toko terlebih dahulu
              </p>
            )}
          </div>

          <div data-tour="invoice-footer" className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary" />
                <h3 className="text-base font-semibold">Footer Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                {showFooter ? (
                  <Eye size={14} className="text-primary" />
                ) : (
                  <EyeOff size={14} className="text-muted-foreground" />
                )}
                <Switch checked={showFooter} onCheckedChange={setShowFooter} />
              </div>
            </div>
            <div className="space-y-3">
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="cth: Barang yang sudah dibeli tidak dapat dikembalikan&#10;Terima kasih atas kunjungan Anda"
                rows={4}
              />
            </div>
          </div>

          <Button
            data-tour="invoice-save"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full gap-2"
            size="lg">
            <Upload size={16} />
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <div
            data-tour="invoice-preview"
            className="bg-card rounded-xl border border-border p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                <h3 className="text-base font-semibold">Pratinjau Invoice</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPreview}
                className="gap-1.5 shrink-0">
                <Printer size={14} />
                {t("page.invoice.printPreview")}
              </Button>
            </div>
            <InvoicePreview
              logo={savedLogo}
              storeName={storeName}
              storePhone={storePhone}
              storeEmail={storeEmail}
              fullAddress={fullAddress}
              footer={footerText}
              socialMedia={socialMedia}
              cashierName={cashierName}
              showLogo={showLogo}
              showStoreName={showStoreName}
              showAddress={showAddress}
              showFooter={showFooter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
