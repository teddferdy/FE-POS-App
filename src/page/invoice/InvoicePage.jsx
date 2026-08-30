import { safeGet, hasOwn } from "@/lib/safe-lookup";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useStore } from "@/contexts/StoreContext";
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
  ChevronRight,
  ArrowLeft,
  ImagePlus,
  Award,
  Medal,
  Coins,
  RotateCcw,
  Printer,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { getInvoiceSetting, updateInvoiceSetting, resetInvoiceSetting } from "@/services/invoice";
import { getLocationById, getAllLocation } from "@/services/location";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalCode
} from "@/services/general";
import { printViaBrowser } from "@/utils/thermalPrint";
import AbortController from "@/components/organism/abort-controller";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import NoStore from "@/components/ui/NoStore";

const DEFAULT_INVOICE_TEMPLATE = {
  showStoreName: true,
  showAddress: true,
  showMemberInfo: true,
  showLogo: true,
  logo: null,
  footer: "Terima kasih atas kunjungan Anda",
  addressFieldsVisibility: {
    storeName: true,
    address: true,
    locationDetail: true,
    province: true,
    city: true,
    district: true,
    village: true,
    postalCode: true,
    phone: true,
    email: true
  },
  memberFieldsVisible: { name: true, tier: true, points: true }
};

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
      <Icon size={18} className="text-muted-foreground" />
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
  locationDetail,
  cityName,
  provinceName,
  districtName,
  villageName,
  postalCodeValue,
  fullAddress,
  cashierName,
  memberName,
  memberTier,
  memberPoints,
  logoUrl,
  showLogo = true,
  showStoreName = true,
  showAddress = true,
  showMemberInfo = true,
  showSocialMedia = true,
  socialMedia = [],
  socialMediaVisible = {},
  addressFieldsVisible = {},
  memberFieldsVisible = {},
  footerText = "Terima kasih atas kunjungan Anda"
}) => {
  const { t } = useTranslation();
  const subtotal = sampleItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const showHeader = showStoreName || showAddress || !!logoUrl;

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 max-w-sm mx-auto overflow-hidden select-all">
      {showHeader && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-6 text-white text-center">
          {showLogo && logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-16 object-contain bg-white rounded-lg p-1 mx-auto mb-3"
            />
          )}
          {showStoreName && (
            <h3 className="text-lg font-bold tracking-tight">{storeName || "NAMA TOKO"}</h3>
          )}
          {showAddress && (
            <div className="text-gray-400 mt-2 space-y-0.5">
              {addressFieldsVisible.storeName !== false && storeName && (
                <p className="text-xs font-medium text-gray-300">{storeName}</p>
              )}
              {addressFieldsVisible.address !== false && locationDetail?.address && (
                <p className="text-[11px]">{locationDetail.address}</p>
              )}
              {addressFieldsVisible.locationDetail !== false && locationDetail?.detailLocation && (
                <p className="text-[11px]">{locationDetail.detailLocation}</p>
              )}
              {(addressFieldsVisible.province !== false ||
                addressFieldsVisible.city !== false ||
                addressFieldsVisible.district !== false ||
                addressFieldsVisible.village !== false) &&
                (provinceName || cityName || districtName || villageName) && (
                  <p className="text-[11px]">
                    {addressFieldsVisible.province !== false && provinceName
                      ? `${provinceName}`
                      : ""}
                    {addressFieldsVisible.city !== false && cityName ? `, ${cityName}` : ""}
                    {addressFieldsVisible.district !== false && districtName
                      ? `, ${districtName}`
                      : ""}
                    {addressFieldsVisible.village !== false && villageName
                      ? `, ${villageName}`
                      : ""}
                  </p>
                )}
              {addressFieldsVisible.postalCode !== false && postalCodeValue && (
                <p className="text-[11px]">Kode Pos: {postalCodeValue}</p>
              )}
              {addressFieldsVisible.phone !== false && storePhone && (
                <p className="text-[11px]">Telp: {storePhone}</p>
              )}
              {addressFieldsVisible.email !== false && storeEmail && (
                <p className="text-[11px]">{storeEmail}</p>
              )}
            </div>
          )}
        </div>
      )}

      {showMemberInfo && (memberName || memberTier) && (
        <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
          <p className="text-[10px] font-semibold text-yellow-800 uppercase tracking-wider mb-2">
            {t("page.invoice.memberInfo")}
          </p>
          <div className="space-y-1">
            {memberName && memberFieldsVisible.name !== false && (
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-yellow-900 font-medium">
                  {t("page.invoice.memberName")}
                </span>
                <span className="text-xs text-yellow-800 font-semibold">{memberName}</span>
              </div>
            )}
            {memberTier && memberFieldsVisible.tier !== false && (
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-yellow-900 font-medium">
                  {t("page.invoice.memberTier")}
                </span>
                <span className="text-xs text-yellow-800 font-semibold">{memberTier}</span>
              </div>
            )}
            {memberPoints !== undefined && memberFieldsVisible.points !== false && (
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-yellow-900 font-medium">
                  {t("page.invoice.totalPoints")}
                </span>
                <span className="text-xs text-yellow-800 font-semibold">
                  {Number(memberPoints).toLocaleString("id-ID")} pts
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="text-left py-2 font-semibold">{t("page.invoice.item")}</th>
                <th className="text-center py-2 font-semibold w-10">Qty</th>
                <th className="text-right py-2 font-semibold">Harga</th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                  <td className="py-2 text-sm text-gray-800">{item.name}</td>
                  <td className="py-2 text-center text-sm text-gray-600">{item.qty}</td>
                  <td className="py-2 text-right text-sm text-gray-600">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-2 text-right text-sm font-medium text-gray-900">
                    {formatPrice(item.qty * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("page.invoice.subtotal")}</span>
            <span className="text-gray-700 font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pajak (10%)</span>
            <span className="text-gray-700 font-medium">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
            <span className="text-gray-900 font-bold text-base">{t("page.invoice.total")}</span>
            <span className="text-gray-900 font-bold text-base">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <p
          className="text-center text-gray-400 text-xs italic overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
            textOverflow: "ellipsis"
          }}>
          {footerText || t("page.invoice.footerDefault")}
        </p>
        {showSocialMedia &&
          socialMedia.filter((_, i) => safeGet(socialMediaVisible, i)).length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-gray-200">
              {socialMedia
                .filter((_, i) => safeGet(socialMediaVisible, i))
                .map((sm, i) => (
                  <span key={i} className="text-gray-400 text-[10px]">
                    {sm.platform}: {sm.account}
                  </span>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

const InvoicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies();
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const { setActiveStore, isSuperAdmin: ctxSuperAdmin } = useStore();

  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const [selectedStore, setSelectedStore] = useState(isSuperAdmin ? "" : String(user?.store || ""));
  const cashierName = user?.userName || user?.name || user?.fullName || "";

  const { data: locData, isLoading: locLoading } = useQuery(
    ["active-locations"],
    () => getAllLocation("active"),
    {
      enabled: isSuperAdmin
    }
  );
  const locationList = locData?.data || locData || [];

  const {
    data: storeData,
    isLoading: storeLoading,
    isError: storeError,
    refetch: refetchStore
  } = useQuery(["store-detail", selectedStore], () => getLocationById({ id: selectedStore }), {
    enabled: !!selectedStore
  });
  const locationDetail = (storeData?.data || storeData) ?? null;
  const hasStore = !!locationDetail && !!(locationDetail?.name || locationDetail?.storeName);
  const storeName = hasStore ? locationDetail?.name || locationDetail?.storeName : "Nama Toko";
  const storePhone = hasStore ? locationDetail?.phoneNumber || "" : "";
  const storeEmail = hasStore ? locationDetail?.email || "" : "";

  const [showStoreName, setShowStoreName] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showMemberInfo, setShowMemberInfo] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showSocialMedia, setShowSocialMedia] = useState(true);
  const [socialMediaVisible, setSocialMediaVisible] = useState({});
  const [addressFieldsVisible, setAddressFieldsVisible] = useState({
    storeName: true,
    address: true,
    locationDetail: true,
    province: true,
    city: true,
    district: true,
    village: true,
    postalCode: true,
    phone: true,
    email: true
  });
  const [memberFieldsVisible, setMemberFieldsVisible] = useState({
    name: true,
    tier: true,
    points: true
  });
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [footerText, setFooterText] = useState("Terima kasih atas kunjungan Anda");
  const [isSaving, setIsSaving] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);

  const { data: provinces } = useQuery(["provinces"], getProvinces, {
    enabled: hasStore && !!locationDetail?.province
  });
  const { data: cities } = useQuery(
    ["cities", locationDetail?.province],
    () => getCities(locationDetail.province),
    { enabled: hasStore && !!locationDetail?.province }
  );
  const { data: districts } = useQuery(
    ["districts", locationDetail?.city],
    () => getDistricts(locationDetail.city),
    { enabled: hasStore && !!locationDetail?.city }
  );
  const { data: villages } = useQuery(
    ["villages", locationDetail?.district],
    () => getVillages(locationDetail.district),
    { enabled: hasStore && !!locationDetail?.district }
  );
  const { data: postalCodes } = useQuery(
    ["postal-codes", locationDetail?.village],
    () => getPostalCode(locationDetail.village),
    { enabled: hasStore && !!locationDetail?.village }
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

  const hasAddress = !!locationDetail?.address;
  const hasDetailLocation = !!locationDetail?.detailLocation;
  const hasPhone = !!storePhone;
  const hasEmail = !!storeEmail;
  const hasPostalCode = !!postalCodeValue;
  const hasSocialMedia = !!locationDetail?.socialMedia?.length;

  const { data: invoiceSettings } = useQuery(
    ["invoice-settings", selectedStore],
    () => getInvoiceSetting(selectedStore),
    {
      enabled: !!selectedStore
    }
  );

  const settingsData = invoiceSettings?.data || null;

  useEffect(() => {
    if (settingsData) {
      if (settingsData.showStoreName !== undefined) setShowStoreName(settingsData.showStoreName);
      if (settingsData.showAddress !== undefined) setShowAddress(settingsData.showAddress);
      if (settingsData.showMemberInfo !== undefined) setShowMemberInfo(settingsData.showMemberInfo);
      if (settingsData.showLogo !== undefined) setShowLogo(settingsData.showLogo);
      if (settingsData.showSocialMedia !== undefined)
        setShowSocialMedia(settingsData.showSocialMedia);
      if (settingsData.socialMediaVisibility) {
        try {
          const v =
            typeof settingsData.socialMediaVisibility === "string"
              ? JSON.parse(settingsData.socialMediaVisibility)
              : settingsData.socialMediaVisibility;
          setSocialMediaVisible(v);
        } catch (err) {
          console.error("Failed to parse socialMediaVisibility:", err);
        }
      }
      if (settingsData.logo) {
        setLogoUrl(settingsData.logo);
        setLogoPreview(settingsData.logo);
      }
      if (settingsData.footer !== undefined && settingsData.footer !== null) {
        setFooterText(settingsData.footer);
      } else {
        setFooterText(DEFAULT_INVOICE_TEMPLATE.footer);
      }
      if (settingsData.addressFieldsVisibility) {
        try {
          const v =
            typeof settingsData.addressFieldsVisibility === "string"
              ? JSON.parse(settingsData.addressFieldsVisibility)
              : settingsData.addressFieldsVisibility;
          setAddressFieldsVisible((prev) => ({ ...prev, ...v }));
        } catch (err) {
          console.error("Failed to parse addressFieldsVisibility:", err);
        }
      }
      if (settingsData.memberFieldsVisibility) {
        try {
          const v =
            typeof settingsData.memberFieldsVisibility === "string"
              ? JSON.parse(settingsData.memberFieldsVisibility)
              : settingsData.memberFieldsVisibility;
          setMemberFieldsVisible((prev) => ({ ...prev, ...v }));
        } catch (err) {
          console.error("Failed to parse memberFieldsVisibility:", err);
        }
      }
    }
  }, [settingsData]);

  useEffect(() => {
    if (locationDetail?.socialMedia?.length) {
      // ponytail: fromEntries + hasOwn — bebas object injection
      const base = Object.fromEntries(locationDetail.socialMedia.map((_, i) => [i, true]));
      setSocialMediaVisible((prev) => {
        const overrides = Object.entries(prev).filter(([k]) => hasOwn(base, k));
        return { ...base, ...Object.fromEntries(overrides) };
      });
    }
  }, [locationDetail?.socialMedia]);

  const allSelected = locationList.length > 0 && selectedStores.length === locationList.length;

  const fullAddress = [
    locationDetail?.address,
    locationDetail?.detailLocation,
    cityName,
    provinceName,
    districtName,
    villageName,
    postalCodeValue
  ]
    .filter(Boolean)
    .join(", ");

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

  const handleOpenResetModal = () => {
    setSelectedStores([]);
    setResetModalOpen(true);
  };

  const handleToggleStore = (id) => {
    setSelectedStores((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked) => {
    setSelectedStores(checked ? locationList.map((l) => l.id) : []);
  };

  const handleConfirmReset = async () => {
    if (selectedStores.length === 0) {
      toast.error(t("page.invoice.validation.selectStore"));
      return;
    }

    try {
      await resetInvoiceSetting({ stores: selectedStores });
      setShowStoreName(DEFAULT_INVOICE_TEMPLATE.showStoreName);
      setShowAddress(DEFAULT_INVOICE_TEMPLATE.showAddress);
      setShowMemberInfo(DEFAULT_INVOICE_TEMPLATE.showMemberInfo);
      setShowLogo(DEFAULT_INVOICE_TEMPLATE.showLogo);
      setFooterText(DEFAULT_INVOICE_TEMPLATE.footer);
      setAddressFieldsVisible(DEFAULT_INVOICE_TEMPLATE.addressFieldsVisibility);
      setMemberFieldsVisible(DEFAULT_INVOICE_TEMPLATE.memberFieldsVisible);
      setLogoUrl(null);
      setLogoFile(null);
      setLogoPreview(null);
      setResetModalOpen(false);
      queryClient.invalidateQueries(["invoice-settings"]);
      toast.success(t("page.invoice.toast.resetSuccess"));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("page.invoice.toast.resetFailed"));
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("store", selectedStore);
      payload.append("showStoreName", showStoreName);
      payload.append("showAddress", showAddress);
      payload.append("showMemberInfo", showMemberInfo);
      payload.append("showLogo", showLogo);
      payload.append("showSocialMedia", showSocialMedia);
      payload.append("socialMediaVisibility", JSON.stringify(socialMediaVisible));
      payload.append("addressFieldsVisibility", JSON.stringify(addressFieldsVisible));
      payload.append("memberFieldsVisibility", JSON.stringify(memberFieldsVisible));
      payload.append("footer", footerText);
      if (logoFile) {
        payload.append("logo", logoFile);
      } else if (!logoPreview) {
        payload.append("removeLogo", "true");
      }

      await updateInvoiceSetting(payload);
      toast.success(t("page.invoice.toast.saveSuccess"));
      setLogoFile(null);
      queryClient.invalidateQueries(["invoice-settings"]);
    } catch (err) {
      toast.error(err?.response?.data?.message || t("page.invoice.toast.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSave = () => {
    setSaveConfirmOpen(false);
    handleSaveSettings();
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
      footer: footerText
    });
  };

  return (
    <div data-tour="page-settings" className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.invoice.title")}</span>
      </nav>

      <div>
        <h2 className="text-2xl font-bold">{t("page.invoice.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("page.invoice.description")}</p>
      </div>

      {!selectedStore ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center w-full">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Store size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("page.invoice.title")}</h2>
            <p className="text-muted-foreground mb-8">Pilih toko</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {locLoading
                ? [0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card ${
                        i === 1 ? "hidden sm:flex" : i >= 2 ? "hidden lg:flex" : ""
                      }`}>
                      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                      <Skeleton className="w-5 h-5 shrink-0" />
                    </div>
                  ))
                : locationList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStore(String(s.id));
                        if (isSuperAdmin) {
                          setActiveStore(String(s.id), s.name || "");
                        }
                      }}
                      className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15">
                        <Store size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="text-sm text-muted-foreground">Pilih toko</p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                      />
                    </button>
                  ))}
            </div>
          </div>
        </div>
      ) : storeError ? (
        <AbortController refetch={refetchStore} />
      ) : storeLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-5 w-px" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <Skeleton className="h-11 flex-1 rounded-md" />
                <Skeleton className="h-11 flex-1 rounded-md" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedStore("")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
              {t("common.back")}
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Store size={18} className="text-primary" />
              <span className="font-semibold text-lg">{storeName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div data-tour="invoice-logo" className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImagePlus size={18} className="text-primary" />
                    <h3 className="text-base font-semibold">{t("page.invoice.logo")}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImagePlus size={28} className="mx-auto mb-1" />
                        <p className="text-[10px]">{t("page.invoice.noLogo")}</p>
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
                      {logoPreview ? t("page.invoice.changeLogo") : t("page.invoice.selectLogo")}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="gap-2 text-destructive">
                        <X size={14} />
                        {t("page.invoice.deleteLogo")}
                      </Button>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("page.invoice.logoFormat")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-primary" />
                  <h3 className="text-base font-semibold">{t("page.invoice.footer")}</h3>
                </div>
                <Textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder={t("page.invoice.footerPlaceholder")}
                  className="text-sm min-h-[80px]"
                  rows={4}
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  {t("page.invoice.footerDescription")}
                </p>
              </div>

              <div
                data-tour="invoice-address"
                className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <h3 className="text-base font-semibold">{t("page.invoice.storeAddress")}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showAddress} onCheckedChange={setShowAddress} />
                  </div>
                </div>
                {hasStore ? (
                  <div className="space-y-3">
                    {[
                      {
                        key: "storeName",
                        icon: Store,
                        label: t("page.invoice.storeName"),
                        value: storeName,
                        hasData: !!storeName
                      },
                      {
                        key: "address",
                        icon: MapPin,
                        label: t("page.invoice.address"),
                        value: locationDetail?.address,
                        hasData: hasAddress
                      },
                      ...(locationDetail?.detailLocation
                        ? [
                            {
                              key: "locationDetail",
                              icon: Globe,
                              label: t("page.invoice.locationDetail"),
                              value: locationDetail.detailLocation,
                              hasData: hasDetailLocation
                            }
                          ]
                        : []),
                      {
                        key: "province",
                        icon: Building2,
                        label: t("page.invoice.province"),
                        value: provinceName,
                        hasData: !!provinceName
                      },
                      {
                        key: "city",
                        icon: Building2,
                        label: t("page.invoice.city"),
                        value: cityName,
                        hasData: !!cityName
                      },
                      {
                        key: "district",
                        icon: Building2,
                        label: t("page.invoice.district"),
                        value: districtName,
                        hasData: !!districtName
                      },
                      {
                        key: "village",
                        icon: Building2,
                        label: t("page.invoice.village"),
                        value: villageName,
                        hasData: !!villageName
                      },
                      {
                        key: "postalCode",
                        icon: Hash,
                        label: t("page.invoice.postalCode"),
                        value: postalCodeValue,
                        hasData: hasPostalCode
                      },
                      {
                        key: "phone",
                        icon: Phone,
                        label: t("page.invoice.phone"),
                        value: storePhone,
                        hasData: hasPhone
                      },
                      {
                        key: "email",
                        icon: Mail,
                        label: t("page.invoice.email"),
                        value: storeEmail,
                        hasData: hasEmail
                      }
                    ].map(({ key, icon: Icon, label, value, hasData }) => {
                      const isEmpty = hasData === false;
                      return (
                        <label
                          key={key}
                          className={`flex items-center justify-between p-3 rounded-lg border border-border transition-colors ${
                            isEmpty
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-muted/50"
                          }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon size={16} className="text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <p className="text-sm font-medium truncate">{value || "-"}</p>
                            </div>
                          </div>
                          <Switch
                            checked={safeGet(addressFieldsVisible, key) ?? true}
                            disabled={isEmpty}
                            onCheckedChange={(v) =>
                              setAddressFieldsVisible((prev) => ({ ...prev, [key]: v }))
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t("page.invoice.noStoreAvailable")}
                  </p>
                )}
              </div>

              <div
                data-tour="invoice-member"
                className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-yellow-600" />
                    <h3 className="text-base font-semibold">{t("page.invoice.memberInfo")}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={showMemberInfo} onCheckedChange={setShowMemberInfo} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <Medal size={16} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">
                          {t("page.invoice.memberName")}
                        </span>
                        <p className="text-sm font-medium">{sampleMember.name}</p>
                      </div>
                    </div>
                    <Switch
                      checked={memberFieldsVisible.name ?? true}
                      onCheckedChange={(v) =>
                        setMemberFieldsVisible((prev) => ({ ...prev, name: v }))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <Award size={16} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">
                          {t("page.invoice.memberTier")}
                        </span>
                        <p className="text-sm font-medium">{sampleMember.tier}</p>
                      </div>
                    </div>
                    <Switch
                      checked={memberFieldsVisible.tier ?? true}
                      onCheckedChange={(v) =>
                        setMemberFieldsVisible((prev) => ({ ...prev, tier: v }))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <Coins size={16} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground">
                          {t("page.invoice.totalPoints")}
                        </span>
                        <p className="text-sm font-medium">
                          {Number(sampleMember.points).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={memberFieldsVisible.points ?? true}
                      onCheckedChange={(v) =>
                        setMemberFieldsVisible((prev) => ({ ...prev, points: v }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div
                data-tour="invoice-social"
                className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 ${!hasSocialMedia ? "opacity-50" : ""}`}>
                    <Globe size={18} className="text-primary" />
                    <h3 className="text-base font-semibold">{t("page.invoice.socialMedia")}</h3>
                  </div>
                  <Switch
                    checked={showSocialMedia}
                    onCheckedChange={setShowSocialMedia}
                    disabled={!hasSocialMedia}
                  />
                </div>
                {locationDetail?.socialMedia?.length ? (
                  <div className="space-y-3">
                    {locationDetail.socialMedia.map((sm, i) => (
                      <label
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">
                            {sm.platform}: {sm.account}
                          </span>
                        </div>
                        <Switch
                          checked={safeGet(socialMediaVisible, i) ?? true}
                          onCheckedChange={(v) =>
                            setSocialMediaVisible((prev) => ({ ...prev, [i]: v }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t("page.invoice.noStoreAvailable")}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleOpenResetModal}
                  className="flex-1 gap-2"
                  size="lg">
                  <RotateCcw size={16} />
                  {t("page.invoice.resetDefault")}
                </Button>
                <Button
                  variant="success"
                  data-tour="invoice-save"
                  onClick={() => setSaveConfirmOpen(true)}
                  disabled={isSaving}
                  className="flex-1 gap-2"
                  size="lg">
                  {isSaving ? t("page.invoice.saving") : t("page.invoice.saveSettings")}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div
                data-tour="invoice-preview"
                className="bg-card rounded-xl border border-border p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">visibility</span>
                    <h3 className="text-base font-semibold">{t("page.invoice.preview")}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintPreview}
                    className="gap-1.5 shrink-0">
                    <Printer size={14} />
                    {t("page.invoice.printPreview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    PDF
                  </Button>
                </div>
                <InvoicePreview
                  storeName={storeName}
                  storePhone={storePhone}
                  storeEmail={storeEmail}
                  locationDetail={locationDetail}
                  cityName={cityName}
                  provinceName={provinceName}
                  districtName={districtName}
                  villageName={villageName}
                  postalCodeValue={postalCodeValue}
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
                  showSocialMedia={showSocialMedia}
                  socialMedia={locationDetail?.socialMedia || []}
                  socialMediaVisible={socialMediaVisible}
                  addressFieldsVisible={addressFieldsVisible}
                  memberFieldsVisible={memberFieldsVisible}
                  footerText={footerText}
                />
              </div>
            </div>
          </div>

          <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{t("page.invoice.resetTitle")}</DialogTitle>
                <DialogDescription>{t("page.invoice.resetDescription")}</DialogDescription>
              </DialogHeader>

              <div className="py-2">
                {user?.roleType === "super_admin" && locationList.length > 0 && (
                  <label className="flex items-center gap-2 pb-3 mb-3 border-b border-border cursor-pointer">
                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                    <span className="text-sm font-medium">{t("common.selectAll")}</span>
                  </label>
                )}

                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {(user?.roleType === "super_admin" ? locationList : [locationDetail])
                      .filter(Boolean)
                      .map((loc) => (
                        <label
                          key={loc.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={selectedStores.includes(loc.id)}
                            onCheckedChange={() => handleToggleStore(loc.id)}
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            <Store size={16} className="text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{loc.name}</p>
                              {loc.city && (
                                <p className="text-xs text-muted-foreground truncate">{loc.city}</p>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setResetModalOpen(false)}>
                  {t("common.no")}
                </Button>
                <Button onClick={handleConfirmReset}>{t("page.invoice.yesReset")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>{t("page.invoice.saveConfirmTitle")}</DialogTitle>
                <DialogDescription>{t("page.invoice.saveConfirmDesc")}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="danger" onClick={() => setSaveConfirmOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button variant="success" onClick={handleConfirmSave}>
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {isSaving && <Loading fullscreen size="lg" label={t("page.invoice.saving")} />}
    </div>
  );
};

export default InvoicePage;
