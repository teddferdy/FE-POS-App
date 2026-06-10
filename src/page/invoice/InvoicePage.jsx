/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  Hash,
  Globe,
  Building2,
  Store,
  Printer,
  Award,
  Medal,
  Coins,
  ImagePlus,
  X
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

const sampleMember = {
  name: "Budi Santoso",
  tier: "Gold",
  points: 2450
};

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
  storeName,
  storePhone,
  storeEmail,
  fullAddress,
  cashierName,
  memberName,
  memberTier,
  memberPoints,
  logoUrl,
  showLogo = true,
  showStoreName = true,
  showAddress = true,
  showMemberInfo = true
}) => {
  const subtotal = sampleItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const showHeader = showStoreName || showAddress || !!logoUrl;

  return (
    <div className="bg-white text-black rounded-xl shadow-sm border border-border p-5 max-w-sm mx-auto font-mono text-xs leading-relaxed select-all">
      {showHeader && (
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-3">
          {showLogo && logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="max-h-16 mx-auto mb-2 object-contain"
            />
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

      {showMemberInfo && (memberName || memberTier) && (
        <div className="border-b border-dashed border-gray-300 pb-2 mb-3">
          <div className="flex items-center gap-3 text-gray-700 text-[11px]">
            <Medal size={14} className="text-yellow-600 shrink-0" />
            <div className="flex-1 space-y-0.5">
              <span className="block font-medium">{memberName || "-"}</span>
              {memberTier && (
                <span className="block text-gray-500 text-[10px]">Tier: {memberTier}</span>
              )}
              {memberPoints !== undefined && (
                <span className="block text-gray-500 text-[10px]">
                  Poin: {Number(memberPoints).toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

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
  const logoInputRef = useRef(null);

  const user = cookie?.user;
  const store = user?.store || "";
  const cashierName = user?.userName || user?.name || user?.fullName || "";

  const [showStoreName, setShowStoreName] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showMemberInfo, setShowMemberInfo] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: storeData, isError: storeError } = useQuery(
    ["store-detail", store],
    () => getLocationById({ id: store }),
    { enabled: !!store, staleTime: 60 * 1000 }
  );
  const locationDetail = (storeData?.data || storeData) ?? null;
  const hasStore = !!locationDetail && !!(locationDetail?.name || locationDetail?.storeName);
  const storeName = hasStore ? locationDetail?.name || locationDetail?.storeName : "Nama Toko";
  const storePhone = hasStore ? locationDetail?.phoneNumber || "" : "";
  const storeEmail = hasStore ? locationDetail?.email || "" : "";

  const { data: provinces } = useQuery(["provinces"], getProvinces, {
    enabled: hasStore && !!locationDetail?.province,
    staleTime: 30 * 60 * 1000
  });
  const { data: cities } = useQuery(
    ["cities", locationDetail?.province],
    () => getCities(locationDetail.province),
    { enabled: hasStore && !!locationDetail?.province, staleTime: 30 * 60 * 1000 }
  );
  const { data: districts } = useQuery(
    ["districts", locationDetail?.city],
    () => getDistricts(locationDetail.city),
    { enabled: hasStore && !!locationDetail?.city, staleTime: 30 * 60 * 1000 }
  );
  const { data: villages } = useQuery(
    ["villages", locationDetail?.district],
    () => getVillages(locationDetail.district),
    { enabled: hasStore && !!locationDetail?.district, staleTime: 30 * 60 * 1000 }
  );
  const { data: postalCodes } = useQuery(
    ["postal-codes", locationDetail?.village],
    () => getPostalCode(locationDetail.village),
    { enabled: hasStore && !!locationDetail?.village, staleTime: 30 * 60 * 1000 }
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

  useEffect(() => {
    if (settingsData) {
      if (settingsData.showStoreName !== undefined) setShowStoreName(settingsData.showStoreName);
      if (settingsData.showAddress !== undefined) setShowAddress(settingsData.showAddress);
      if (settingsData.showMemberInfo !== undefined) setShowMemberInfo(settingsData.showMemberInfo);
      if (settingsData.showLogo !== undefined) setShowLogo(settingsData.showLogo);
      if (settingsData.logo) {
        setLogoUrl(settingsData.logo);
        setLogoPreview(settingsData.logo);
      }
    }
  }, [settingsData]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoUrl(null);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("store", store);
      payload.append("showStoreName", showStoreName);
      payload.append("showAddress", showAddress);
      payload.append("showMemberInfo", showMemberInfo);
      payload.append("showLogo", showLogo);
      if (logoFile) {
        payload.append("logo", logoFile);
      }
      if (!logoPreview) {
        payload.append("removeLogo", "true");
      }

      await updateInvoiceSetting(payload);
      toast.success("Pengaturan invoice berhasil disimpan");
      setLogoFile(null);
      queryClient.invalidateQueries(["invoice-settings"]);
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
      logo: showLogo ? logoPreview : "",
      memberName: showMemberInfo ? sampleMember.name : "",
      memberTier: showMemberInfo ? sampleMember.tier : "",
      memberPoints: showMemberInfo ? sampleMember.points : 0,
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
      footer: "Terima kasih atas kunjungan Anda"
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImagePlus size={18} className="text-primary" />
                <h3 className="text-base font-semibold">Logo Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus size={28} className="mx-auto mb-1" />
                    <p className="text-[10px]">Belum ada logo</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="gap-2">
                  <ImagePlus size={14} />
                  {logoPreview ? "Ganti Logo" : "Pilih Logo"}
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="gap-2 text-destructive">
                    <X size={14} />
                    Hapus Logo
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format: PNG, JPG. Maks 5MB
                </p>
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
                <Switch checked={showAddress} onCheckedChange={setShowAddress} />
              </div>
            </div>
            {hasStore ? (
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
                <DetailRow icon={Phone} label="Telepon" value={storePhone} />
                <DetailRow icon={Mail} label="Email" value={storeEmail} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Tidak ada toko tersedia</p>
            )}
          </div>

          <div data-tour="invoice-member" className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-yellow-600" />
                <h3 className="text-base font-semibold">Informasi Member</h3>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showMemberInfo} onCheckedChange={setShowMemberInfo} />
              </div>
            </div>
            <div className="divide-y divide-border">
              <DetailRow icon={Medal} label="Nama Member" value={sampleMember.name} />
              <DetailRow icon={Award} label="Tier Member" value={sampleMember.tier} />
              <DetailRow
                icon={Coins}
                label="Total Poin"
                value={Number(sampleMember.points).toLocaleString("id-ID")}
              />
            </div>
          </div>

          <Button
            data-tour="invoice-save"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full gap-2"
            size="lg">
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
              storeName={storeName}
              storePhone={storePhone}
              storeEmail={storeEmail}
              fullAddress={fullAddress}
              cashierName={cashierName}
              memberName={sampleMember.name}
              memberTier={sampleMember.tier}
              memberPoints={sampleMember.points}
              logoUrl={logoPreview}
              showLogo={showLogo}
              showStoreName={showStoreName}
              showAddress={showAddress}
              showMemberInfo={showMemberInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
