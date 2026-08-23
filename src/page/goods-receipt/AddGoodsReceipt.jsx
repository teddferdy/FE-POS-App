import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  X,
  Plus,
  Trash2,
  Package,
  Search,
  ArrowLeft,
  Eye,
  CloudUpload,
  ClipboardCheck,
  ScanLine,
  RotateCcw,
  History
} from "lucide-react";
import { toast } from "sonner";
import { addGoodsReceipt, getGoodsReceiptByPO } from "@/services/goods-receipt";
import { getAllPurchaseOrder, getPurchaseOrderById } from "@/services/purchase-order";
import { getAllProduct } from "@/services/product";
import { getAllEmployee } from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const AddGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [poOpen, setPoOpen] = useState(false);
  const poRef = useRef(null);
  const [picSearch, setPicSearch] = useState("");
  const [picOpen, setPicOpen] = useState(false);
  const [selectedPic, setSelectedPic] = useState(null);
  const picRef = useRef(null);
  // multiple documentation photos: [{ file, url, isNew }]
  const [docs, setDocs] = useState([]);
  const docInputRef = useRef(null);
  const [suratJalan, setSuratJalan] = useState("");
  const [taxInvoiceNo, setTaxInvoiceNo] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [scanValue, setScanValue] = useState("");
  const qtyInputRefs = useRef(new Map());

  const docFiles = docs.filter((d) => d.isNew).map((d) => d.file);

  useEffect(() => {
    const isDirty =
      items.some((it) => parseFloat(it.qtyReceived) > 0) ||
      docs.length > 0 ||
      suratJalan.trim() ||
      taxInvoiceNo.trim() ||
      parseFloat(shippingCost) > 0;
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [items, docs, suratJalan, taxInvoiceNo, shippingCost]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (poRef.current && !poRef.current.contains(e.target)) {
        setPoOpen(false);
        setPoSearch("");
      }
      if (picRef.current && !picRef.current.contains(e.target)) {
        setPicOpen(false);
        setPicSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unitOptions = [
    { value: "pcs", label: t("unit.pcs") },
    { value: "buah", label: t("unit.buah") },
    { value: "kg", label: t("unit.kg") },
    { value: "gram", label: t("unit.gram") },
    { value: "liter", label: t("unit.liter") },
    { value: "ml", label: t("unit.ml") },
    { value: "meter", label: t("unit.meter") },
    { value: "cm", label: t("unit.cm") },
    { value: "lusin", label: t("unit.lusin") },
    { value: "box", label: t("unit.box") },
    { value: "pack", label: t("unit.pack") },
    { value: "karton", label: t("unit.karton") }
  ];

  const getItemRemaining = (item) =>
    item.isFromPo
      ? Math.max(
          0,
          (Number(item.qty) || 0) -
            (Number(item.returnedQty) || 0) -
            (Number(item.receivedQuantity) || 0)
        )
      : Math.max(0, Number(item.qty) || 0);

  const grSchema = z.object({
    poId: z.string().min(1, t("page.goodsReceipt.add.toast.poRequired")),
    receivedDate: z.date().nullable().optional(),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          ingredient: z.any().nullable().optional(),
          ingredientName: z.string().optional(),
          product: z.any().nullable().optional(),
          purchaseOrderItem: z.any().nullable().optional(),
          qty: z.any().optional(),
          returnedQty: z.any().optional(),
          receivedQuantity: z.any().optional(),
          unit: z.string().optional(),
          qtyReceived: z.string().optional(),
          conditionNotes: z.string().optional(),
          costPrice: z.any().optional(),
          conversionToBase: z.any().optional(),
          batchNumber: z.string().optional(),
          expiryDate: z.string().optional(),
          isFromPo: z.boolean().optional()
        })
      )
      .min(1, t("page.goodsReceipt.add.toast.itemRequired"))
  });

  const form = useForm({
    resolver: zodResolver(grSchema),
    mode: "onChange",
    defaultValues: {
      poId: searchParams.get("poId") || "",
      receivedDate: new Date(),
      notes: "",
      items: []
    }
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    clearErrors
  } = form;

  const isPoFromUrl = !!searchParams.get("poId");

  const { fields, remove, replace } = useFieldArray({
    control,
    name: "items"
  });

  const items = watch("items") || [];
  const poId = watch("poId");

  const { data: poData, isLoading: loadingPOs } = useQuery(
    ["pos-for-gr"],
    () => getAllPurchaseOrder({ limit: 9999, status: "pending,ordered" }),
    {
      enabled: !isPoFromUrl
    }
  );
  const purchaseOrders = poData?.data || [];
  const filteredPOs = purchaseOrders.filter((po) =>
    po.orderNumber?.toLowerCase().includes(poSearch.toLowerCase())
  );

  const { data: poDetail, isLoading: loadingPo } = useQuery(
    ["po-detail", poId],
    () => getPurchaseOrderById(poId),
    { enabled: !!poId }
  );

  useEffect(() => {
    if (poDetail?.data?.items) {
      const poItems = poDetail.data.items;
      const mapped = poItems.map((item) => ({
        ingredient: item.ingredient || null,
        ingredientName: item.ingredientName || item.productData?.nameProduct || "",
        product: item.product || null,
        purchaseOrderItem: item.id,
        qty: item.quantity,
        returnedQty: item.returnedQty || 0,
        receivedQuantity: item.receivedQuantity || 0,
        unit: item.unit || "pcs",
        qtyReceived: "0",
        conditionNotes: "",
        batchNumber: "",
        expiryDate: "",
        costPrice: item.price || 0,
        conversionToBase: item.conversionToBase || 1,
        isFromPo: true
      }));
      replace(mapped);
      clearErrors("items");
    }
  }, [poDetail]);

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));

  const poItemLanded = useMemo(() => {
    const poItems = poDetail?.data?.items || [];
    const totalValue = poItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
    const addCost = poDetail?.data?.additionalCost || 0;
    const map = {};
    poItems.forEach((it) => {
      map[it.id] = totalValue > 0 ? Math.round((addCost * (it.price || 0)) / totalValue) : 0;
    });
    return map;
  }, [poDetail]);

  const grStoreId = poDetail?.data?.store || selectedPO?.store;
  const { data: employeesData } = useQuery(
    ["employees-for-gr", grStoreId],
    () => getAllEmployee({ limit: 999, status: "active", location: grStoreId || undefined }),
    { enabled: !!grStoreId }
  );
  const employees = employeesData?.data || [];
  const filteredEmployees = employees.filter((e) =>
    (e.fullName || e.userName)?.toLowerCase().includes(picSearch.toLowerCase())
  );

  // riwayat penerimaan (GR sebelumnya utk PO yang sama)
  const { data: grHistoryData } = useQuery(
    ["gr-history-po", poId],
    () => getGoodsReceiptByPO(poId),
    { enabled: !!poId }
  );
  const grHistory = (grHistoryData?.data || []).filter((g) => g.status !== "cancelled");

  // produk utk pemindaian barcode (hanya baris produk yg punya barcode)
  const { data: productsData } = useQuery(
    ["products-for-gr-scan", grStoreId],
    () => getAllProduct({ location: grStoreId }),
    { enabled: !!grStoreId }
  );
  // ponytail: Map untuk indeks barcode & refs — bebas object injection
  const barcodeToIdx = new Map();
  if (items.length && productsData?.data) {
    const productIdToBarcode = new Map();
    productsData.data.forEach((p) => {
      if (p.barcode) productIdToBarcode.set(p.id, String(p.barcode));
    });
    items.forEach((it, idx) => {
      const bc = it.product ? productIdToBarcode.get(it.product) : null;
      if (bc && !barcodeToIdx.has(bc)) barcodeToIdx.set(bc, idx);
    });
  }
  const hasScannableRows = barcodeToIdx.size > 0;

  const handleScan = (e) => {
    const value = e.target.value;
    setScanValue(value);
    const exact = value.trim();
    if (!exact) return;
    const idx = barcodeToIdx.get(exact);
    if (idx !== undefined) {
      const input = qtyInputRefs.current.get(idx);
      if (input) {
        input.focus();
        input.select?.();
      }
      toast.success(
        t("page.goodsReceipt.add.scan.found", { name: items.at(idx)?.ingredientName || "" })
      );
      setScanValue("");
    }
  };

  const handleReceiveAll = () => {
    let filled = 0;
    items.forEach((it, idx) => {
      if (!it.isFromPo) return;
      const remaining = getItemRemaining(it);
      if (remaining > 0 && parseFloat(it.qtyReceived || 0) !== remaining) {
        setValue(`items.${idx}.qtyReceived`, String(remaining), { shouldDirty: true });
        filled += 1;
      }
    });
    if (filled > 0) {
      toast.success(t("page.goodsReceipt.add.toast.receiveAllDone", { count: filled }));
    } else {
      toast.info(t("page.goodsReceipt.add.toast.receiveAllNone"));
    }
  };

  const grSummary = items.reduce(
    (acc, it) => {
      if (!(it.ingredientName || it.ingredient)) return acc;
      const price = parseFloat(it.costPrice) || 0;
      const ordered = it.isFromPo
        ? Math.max(0, (Number(it.qty) || 0) - (Number(it.returnedQty) || 0))
        : Number(it.qty) || 0;
      const prev = it.isFromPo ? Number(it.receivedQuantity) || 0 : 0;
      const remaining = Math.max(getItemRemaining(it), 0);
      const now = Math.min(Math.max(parseFloat(it.qtyReceived) || 0, 0), remaining);
      acc.target += Math.max(ordered - prev, 0);
      acc.filled += now;
      if (now > 0) acc.count += 1;
      acc.orderedValue += ordered * price;
      acc.prevValue += prev * price;
      acc.nowValue += now * price;
      acc.shortageValue += Math.max(remaining - now, 0) * price;
      if (prev > 0) acc.hasPrev = true;
      return acc;
    },
    {
      target: 0,
      filled: 0,
      count: 0,
      orderedValue: 0,
      prevValue: 0,
      nowValue: 0,
      shortageValue: 0,
      hasPrev: false
    }
  );

  const receiptProgress = {
    ...grSummary,
    done: grSummary.target > 0 && grSummary.filled >= grSummary.target
  };

  const handleDocChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;
    const tooLarge = incoming.find((f) => f.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error(t("page.goodsReceipt.add.form.fileTooLarge"));
      e.target.value = "";
      return;
    }
    const room = 5 - docs.length;
    if (room <= 0) {
      toast.error(t("page.goodsReceipt.add.form.docMaxReached"));
      e.target.value = "";
      return;
    }
    const accepted = incoming.slice(0, room);
    if (accepted.length < incoming.length) {
      toast.info(t("page.goodsReceipt.add.form.docMaxReached"));
    }
    setDocs((prev) => [
      ...prev,
      ...accepted.map((f) => ({ file: f, url: URL.createObjectURL(f), isNew: true }))
    ]);
    e.target.value = "";
  };

  const removeDoc = (idx) => {
    setDocs((prev) => {
      const target = prev[idx];
      if (target?.isNew) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateItem = (idx, field, value) => setValue(`items.${idx}.${field}`, value);

  const doSubmit = async (data, saveAsDraft = false) => {
    setIsSubmitting(true);
    try {
      const validItems = data.items.filter(
        (it) => parseFloat(it.qtyReceived) > 0 && (it.ingredientName || it.ingredient)
      );
      if (validItems.length === 0) {
        toast.error(t("page.goodsReceipt.add.toast.itemRequired"));
        return;
      }
      const overReceived = validItems.some(
        (it) => parseFloat(it.qtyReceived) > getItemRemaining(it)
      );
      if (overReceived) {
        toast.error(t("page.goodsReceipt.add.toast.qtyExceed"));
        return;
      }
      // tanggal terima tidak boleh sebelum tanggal PO
      const poOrderDate = poDetail?.data?.orderDate ? new Date(poDetail.data.orderDate) : null;
      const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (
        poOrderDate &&
        data.receivedDate instanceof Date &&
        startOfDay(data.receivedDate) < startOfDay(poOrderDate)
      ) {
        toast.error(t("page.goodsReceipt.add.toast.dateBeforePo"));
        return;
      }
      const payload = {
        purchaseOrderId: parseInt(data.poId),
        receivedDate:
          data.receivedDate instanceof Date
            ? data.receivedDate.toISOString().split("T")[0]
            : data.receivedDate,
        notes: data.notes,
        pic: selectedPic?.id || null,
        suratJalan: suratJalan.trim() || null,
        taxInvoiceNo: taxInvoiceNo.trim() || null,
        shippingCost: parseFloat(shippingCost) || 0,
        status: saveAsDraft ? "draft" : "completed",
        items: validItems.map((it) => ({
          purchaseOrderItem: it.purchaseOrderItem,
          ingredient: it.ingredient,
          ingredientName: it.ingredientName,
          product: it.product,
          qtyReceived: parseFloat(it.qtyReceived),
          unit: it.unit,
          conditionNotes: it.conditionNotes,
          batchNumber: it.batchNumber?.trim() || null,
          expiryDate: it.expiryDate || null,
          costPrice: parseFloat(it.costPrice) || 0,
          conversionToBase: parseFloat(it.conversionToBase) || 1
        }))
      };
      await addGoodsReceipt(payload, docFiles);
      toast.success(t("page.goodsReceipt.add.toast.success"), {
        description: t("page.goodsReceipt.add.toast.successDesc")
      });
      queryClient.invalidateQueries(["goods-receipts"]);
      navigate("/goods-receipt");
    } catch (err) {
      setModalMessage(err?.response?.data?.message || err.message);
      setErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setCancelModal(true)}>
            <ArrowLeft size={16} />
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/dashboard-super-admin")}
              className="hover:text-foreground">
              {t("breadcrumb.dashboard")}
            </button>
            <span className="text-xs">/</span>
            <button onClick={() => navigate("/goods-receipt")} className="hover:text-foreground">
              {t("breadcrumb.goodsReceipt")}
            </button>
            <span className="text-xs">/</span>
            <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
          </nav>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{t("page.goodsReceipt.add.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.goodsReceipt.add.description")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => doSubmit(data, false))}
          className="bg-card p-4 sm:p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.purchaseOrder")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              {loadingPOs || (isPoFromUrl && loadingPo) ? (
                <Skeleton className="h-10 w-full" />
              ) : isPoFromUrl && poDetail?.data ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-10 px-3 rounded-md border border-input bg-muted/50 text-sm flex items-center text-muted-foreground cursor-not-allowed">
                    <Package size={14} className="mr-2 shrink-0" />
                    {poDetail.data.orderNumber}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => window.open(`/purchase-order/detail?id=${poId}`, "_blank")}>
                    <Eye size={14} className="mr-1" /> {t("page.goodsReceipt.add.form.viewPO")}
                  </Button>
                </div>
              ) : isPoFromUrl ? (
                <div className="h-10 px-3 rounded-md border border-destructive/50 bg-destructive/5 text-sm flex items-center text-destructive">
                  {t("page.goodsReceipt.add.form.poNotFound")}
                </div>
              ) : purchaseOrders.length === 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {t("page.goodsReceipt.add.form.noPOEmpty")}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate("/add-purchase-order")}>
                    <Plus size={14} /> {t("page.goodsReceipt.add.form.addPO")}
                  </Button>
                </div>
              ) : (
                <div className="relative" ref={poRef}>
                  <div
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center cursor-pointer"
                    onClick={() => setPoOpen(!poOpen)}>
                    <Search size={14} className="mr-2 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={poOpen ? poSearch : selectedPO?.orderNumber || ""}
                      readOnly={!poOpen}
                      onFocus={() => setPoOpen(true)}
                      onChange={(e) => setPoSearch(e.target.value)}
                      placeholder={t("page.goodsReceipt.add.form.selectPO")}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                  {poOpen && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                      {filteredPOs.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {t("page.goodsReceipt.add.form.noPOSearch")}
                        </div>
                      ) : (
                        filteredPOs.map((po) => (
                          <div
                            key={po.id}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                              String(po.id) === poId ? "bg-accent" : ""
                            }`}
                            onClick={() => {
                              setValue("poId", String(po.id));
                              replace([]);
                              setPoSearch("");
                              setPoOpen(false);
                            }}>
                            {po.orderNumber}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              {!isPoFromUrl && selectedPO && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.add.form.status")}: {selectedPO.status}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.add.form.store")}: {selectedPO.storeData?.name || "-"}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("page.goodsReceipt.add.form.receivedDate")}</Label>
              <Controller
                control={control}
                name="receivedDate"
                render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.pic")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <div className="relative" ref={picRef}>
                <div
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center cursor-pointer"
                  onClick={() => setPicOpen(!picOpen)}>
                  <Search size={14} className="mr-2 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={
                      picOpen ? picSearch : selectedPic?.fullName || selectedPic?.userName || ""
                    }
                    readOnly={!picOpen}
                    onFocus={() => setPicOpen(true)}
                    onChange={(e) => setPicSearch(e.target.value)}
                    placeholder={t("page.goodsReceipt.add.form.picPlaceholder")}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
                {picOpen && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {t("page.goodsReceipt.add.form.picEmpty")}
                      </div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                            selectedPic?.id === emp.id ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setSelectedPic(emp);
                            setPicSearch("");
                            setPicOpen(false);
                          }}>
                          {emp.fullName || emp.userName}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedPic && (
                <button
                  type="button"
                  onClick={() => setSelectedPic(null)}
                  className="text-xs text-muted-foreground hover:text-destructive">
                  {t("page.goodsReceipt.add.form.clearPic")}
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.documentation")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={docInputRef}
                className="hidden"
                onChange={handleDocChange}
              />
              <div className="grid grid-cols-3 gap-2">
                {docs.map((d, idx) => (
                  <div
                    key={`${d.url}-${idx}`}
                    className="relative rounded-lg border border-border overflow-hidden bg-muted/30 group">
                    <img src={d.url} alt={`doc-${idx + 1}`} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeDoc(idx)}
                      className="absolute top-1 right-1 p-1 bg-background/90 rounded-full text-muted-foreground hover:text-destructive shadow">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {docs.length < 5 && (
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="h-20 rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary bg-muted/30">
                    <CloudUpload size={18} />
                    <span className="text-[11px] font-medium">
                      {t("page.goodsReceipt.add.form.docAdd")}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("page.goodsReceipt.add.form.docHint")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.suratJalan")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <Input
                type="text"
                value={suratJalan}
                onChange={(e) => setSuratJalan(e.target.value)}
                placeholder={t("page.goodsReceipt.add.placeholder.suratJalan")}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.taxInvoiceNo")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <Input
                type="text"
                value={taxInvoiceNo}
                onChange={(e) => setTaxInvoiceNo(e.target.value)}
                placeholder={t("page.goodsReceipt.add.placeholder.taxInvoiceNo")}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.add.form.shippingCost")}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={shippingCost ? Number(shippingCost).toLocaleString("id-ID") : ""}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setShippingCost(raw);
                  }}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("page.goodsReceipt.add.form.shippingHint")}
              </p>
            </div>
          </div>

          {(() => {
            const po = selectedPO || poDetail?.data;
            if (!po || po.paymentMethod !== "credit") return null;
            const dpPct = Number(po.dpPercent || 0);
            const total = Number(po.finalAmount || po.totalAmount || 0);
            const dpAmount = (dpPct / 100) * total;
            const paid = Number(po.totalPaid || 0);
            if (paid >= dpAmount) return null;
            return (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">!</span>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold">{t("page.goodsReceipt.add.dpWarning.title")}</p>
                  <p className="mt-1 text-red-600 dark:text-red-400">
                    {t("page.goodsReceipt.add.dpWarning.description", {
                      dp: dpAmount.toLocaleString("id-ID"),
                      paid: paid.toLocaleString("id-ID")
                    })}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{t("page.goodsReceipt.add.form.items")}</Label>
              <div className="flex items-center gap-2">
                {poId && fields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={handleReceiveAll}>
                    <ClipboardCheck size={14} />
                    {t("page.goodsReceipt.add.form.receiveAll")}
                  </Button>
                )}
                {poId && receiptProgress.target > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      receiptProgress.done
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                    {receiptProgress.done
                      ? t("page.goodsReceipt.add.status.selesai")
                      : t("page.goodsReceipt.add.status.belumSelesai")}
                    {!receiptProgress.done && (
                      <span className="font-normal">
                        ({receiptProgress.filled.toLocaleString("id-ID")}/
                        {receiptProgress.target.toLocaleString("id-ID")})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            {loadingPo && poId ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : poId ? (
              <>
                {hasScannableRows && (
                  <div className="relative max-w-sm">
                    <ScanLine
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="text"
                      value={scanValue}
                      onChange={handleScan}
                      placeholder={t("page.goodsReceipt.add.scan.placeholder")}
                      className="pl-9"
                    />
                  </div>
                )}
                <div className="lg:hidden space-y-3">
                  {fields.map((field, idx) => {
                    const item = Object.hasOwn(items, idx) ? items[idx] : {}; // codacy-ignore-line
                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-border bg-background overflow-hidden">
                        <div className="flex items-start justify-between gap-2 px-4 py-3 bg-muted/40 border-b border-border/60">
                          {item.isFromPo ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <Package size={14} className="text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {item.ingredientName}
                              </span>
                            </div>
                          ) : (
                            <Input
                              type="text"
                              value={item.ingredientName}
                              onChange={(e) => updateItem(idx, "ingredientName", e.target.value)}
                              className="h-9 text-sm flex-1"
                              placeholder={t("page.goodsReceipt.add.placeholder.name")}
                            />
                          )}
                          {!item.isFromPo && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="text-muted-foreground/40 hover:text-destructive shrink-0">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.qtyPo")}
                            </span>
                            {item.isFromPo ? (
                              <div className="text-sm font-semibold">
                                {Math.max(0, item.qty - item.returnedQty)}
                                {item.returnedQty > 0 && (
                                  <span className="text-xs font-normal text-muted-foreground ml-1">
                                    ({t("page.goodsReceipt.add.label.returned")}: {item.returnedQty}
                                    )
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={item.qty || ""}
                                onChange={(e) =>
                                  updateItem(idx, "qty", e.target.value.replace(/[^0-9]/g, ""))
                                }
                                className="h-9 text-sm"
                                placeholder={t("page.goodsReceipt.add.placeholder.qty")}
                              />
                            )}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.remaining")}
                            </span>
                            {item.isFromPo ? (
                              (() => {
                                const remaining = Math.max(
                                  0,
                                  item.qty - item.returnedQty - (item.receivedQuantity || 0)
                                );
                                const receivedAlready = item.receivedQuantity || 0;
                                return (
                                  <div
                                    className={`text-sm font-semibold ${
                                      remaining === 0
                                        ? "text-red-500"
                                        : receivedAlready > 0
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    }`}>
                                    {remaining}
                                    {receivedAlready > 0 && (
                                      <span className="text-xs font-normal text-muted-foreground ml-1">
                                        (prev: {receivedAlready})
                                      </span>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.unit")}
                            </span>
                            {item.isFromPo ? (
                              <span className="inline-flex px-2 py-1 rounded text-xs bg-muted capitalize">
                                {item.unit}
                              </span>
                            ) : (
                              <Combobox
                                options={unitOptions}
                                value={item.unit}
                                onChange={(val) => updateItem(idx, "unit", val)}
                                placeholder={t("unit.pcs")}
                                searchPlaceholder={t("common.search")}
                              />
                            )}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.conversion")}
                            </span>
                            {item.isFromPo ? (
                              <div>
                                <span className="inline-flex px-2 py-1 rounded text-xs bg-muted">
                                  {parseFloat(item.conversionToBase) || 1}
                                </span>
                                {parseFloat(item.qtyReceived) > 0 && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    ={" "}
                                    {(
                                      parseFloat(item.qtyReceived) * (item.conversionToBase || 1)
                                    ).toLocaleString("id-ID")}{" "}
                                    stok
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.conversionToBase ? String(item.conversionToBase) : "1"}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "conversionToBase",
                                    Number(e.target.value.replace(/[^0-9.]/g, "")) || 1
                                  )
                                }
                                className="h-9 text-sm"
                                placeholder="1"
                              />
                            )}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.qtyReceived")}
                            </span>
                            <Input
                              type="text"
                              inputMode="decimal"
                              ref={(el) => qtyInputRefs.current.set(idx, el)}
                              value={item.qtyReceived === "0" ? "" : item.qtyReceived}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const raw = e.target.value
                                  .replace(/[^0-9.]/g, "")
                                  .replace(/(\..*)\./g, "$1");
                                const max = getItemRemaining(item);
                                const num = parseFloat(raw);
                                updateItem(idx, "qtyReceived", num > max ? String(max) : raw);
                              }}
                              className="h-9 text-sm"
                              placeholder={t("page.goodsReceipt.add.placeholder.qty")}
                            />
                            {(() => {
                              const max = getItemRemaining(item);
                              const val = parseFloat(item.qtyReceived) || 0;
                              if (val <= 0 || max <= 0) return null;
                              return val >= max ? (
                                <p className="text-[10px] font-medium text-emerald-600 mt-1">
                                  {t("page.goodsReceipt.add.status.pas")}
                                </p>
                              ) : (
                                <p className="text-[10px] font-medium text-amber-600 mt-1">
                                  {t("page.goodsReceipt.add.status.kurang", { qty: max - val })}
                                </p>
                              );
                            })()}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.costPrice")}
                            </span>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={item.costPrice ? String(item.costPrice) : ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateItem(
                                  idx,
                                  "costPrice",
                                  e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                                )
                              }
                              className="h-9 text-sm"
                              placeholder={t("page.goodsReceipt.add.placeholder.costPrice")}
                            />
                            {(() => {
                              const landed = poItemLanded[item.purchaseOrderItem] || 0;
                              return landed > 0 ? (
                                <p className="text-[10px] text-emerald-600 mt-1">
                                  <span className="block">
                                    {t("page.goodsReceipt.add.table.landed")}
                                  </span>
                                  <span className="block">
                                    + Rp {landed.toLocaleString("id-ID")}
                                  </span>
                                </p>
                              ) : null;
                            })()}
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.batch")}
                            </span>
                            <Input
                              type="text"
                              value={item.batchNumber || ""}
                              onChange={(e) => updateItem(idx, "batchNumber", e.target.value)}
                              className="h-9 text-sm"
                              placeholder={t("page.goodsReceipt.add.placeholder.batch")}
                            />
                          </div>
                          <div>
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.expiry")}
                            </span>
                            <Input
                              type="date"
                              value={item.expiryDate || ""}
                              onChange={(e) => updateItem(idx, "expiryDate", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[11px] font-medium text-muted-foreground mb-1.5">
                              {t("page.goodsReceipt.add.table.notes")}
                            </span>
                            <Input
                              type="text"
                              value={item.conditionNotes}
                              onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                              className="h-9 text-sm"
                              placeholder={t("page.goodsReceipt.add.placeholder.condition")}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden lg:block overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="bg-muted/60 border-b">
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.name")}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.qtyPo")}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.remaining")}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.unit")}
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.conversion")}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.qtyReceived")}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.costPrice")}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.batch")}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.expiry")}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                          {t("page.goodsReceipt.add.table.notes")}
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, idx) => {
                        const item = Object.hasOwn(items, idx) ? items[idx] : {}; // codacy-ignore-line
                        return (
                          <tr key={field.id} className="border-b border-muted/20">
                            <td className="px-3 py-2">
                              {item.isFromPo ? (
                                <div className="flex items-center gap-2">
                                  <Package size={14} className="text-muted-foreground shrink-0" />
                                  <span className="text-sm font-medium">{item.ingredientName}</span>
                                </div>
                              ) : (
                                <Input
                                  type="text"
                                  value={item.ingredientName}
                                  onChange={(e) =>
                                    updateItem(idx, "ingredientName", e.target.value)
                                  }
                                  className="h-8 text-xs"
                                  placeholder={t("page.goodsReceipt.add.placeholder.name")}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {item.isFromPo ? (
                                <span className="text-sm text-muted-foreground">
                                  {Math.max(0, item.qty - item.returnedQty)}
                                  {item.returnedQty > 0 && (
                                    <span className="text-xs text-muted-foreground/60 ml-1">
                                      ({t("page.goodsReceipt.add.label.returned")}:{" "}
                                      {item.returnedQty})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.qty || ""}
                                  onChange={(e) =>
                                    updateItem(idx, "qty", e.target.value.replace(/[^0-9]/g, ""))
                                  }
                                  className="h-8 text-xs text-center w-16 mx-auto"
                                  placeholder={t("page.goodsReceipt.add.placeholder.qty")}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {(() => {
                                const remaining = Math.max(
                                  0,
                                  item.qty - item.returnedQty - (item.receivedQuantity || 0)
                                );
                                const receivedAlready = item.receivedQuantity || 0;
                                return (
                                  <span
                                    className={`text-sm ${
                                      remaining === 0
                                        ? "text-red-500"
                                        : receivedAlready > 0
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    }`}>
                                    {remaining}
                                    {receivedAlready > 0 && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (prev: {receivedAlready})
                                      </span>
                                    )}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex justify-center">
                                {item.isFromPo ? (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-muted capitalize">
                                    {item.unit}
                                  </span>
                                ) : (
                                  <Combobox
                                    options={unitOptions}
                                    value={item.unit}
                                    onChange={(val) => updateItem(idx, "unit", val)}
                                    placeholder={t("unit.pcs")}
                                    searchPlaceholder={t("common.search")}
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {item.isFromPo ? (
                                <div className="text-center">
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs bg-muted">
                                    {parseFloat(item.conversionToBase) || 1}
                                  </span>
                                  {parseFloat(item.qtyReceived) > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      ={" "}
                                      {(
                                        parseFloat(item.qtyReceived) * (item.conversionToBase || 1)
                                      ).toLocaleString("id-ID")}{" "}
                                      stok
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={
                                      item.conversionToBase ? String(item.conversionToBase) : "1"
                                    }
                                    onChange={(e) =>
                                      updateItem(
                                        idx,
                                        "conversionToBase",
                                        Number(e.target.value.replace(/[^0-9.]/g, "")) || 1
                                      )
                                    }
                                    className="h-8 text-xs text-center w-16"
                                    placeholder="1"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="text"
                                inputMode="decimal"
                                ref={(el) => qtyInputRefs.current.set(idx, el)}
                                value={item.qtyReceived === "0" ? "" : item.qtyReceived}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const raw = e.target.value
                                    .replace(/[^0-9.]/g, "")
                                    .replace(/(\..*)\./g, "$1");
                                  const max = getItemRemaining(item);
                                  const num = parseFloat(raw);
                                  updateItem(idx, "qtyReceived", num > max ? String(max) : raw);
                                }}
                                className="h-8 text-xs text-right w-24 ml-auto"
                                placeholder={t("page.goodsReceipt.add.placeholder.qty")}
                              />
                              {(() => {
                                const max = getItemRemaining(item);
                                const val = parseFloat(item.qtyReceived) || 0;
                                if (val <= 0 || max <= 0) return null;
                                return val >= max ? (
                                  <p className="text-[10px] font-medium text-emerald-600 mt-0.5 text-right">
                                    {t("page.goodsReceipt.add.status.pas")}
                                  </p>
                                ) : (
                                  <p className="text-[10px] font-medium text-amber-600 mt-0.5 text-right">
                                    {t("page.goodsReceipt.add.status.kurang", { qty: max - val })}
                                  </p>
                                );
                              })()}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={item.costPrice ? String(item.costPrice) : ""}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "costPrice",
                                    e.target.value
                                      .replace(/[^0-9.]/g, "")
                                      .replace(/(\..*)\./g, "$1")
                                  )
                                }
                                className="h-8 text-xs text-right w-28 ml-auto"
                                placeholder={t("page.goodsReceipt.add.placeholder.costPrice")}
                              />
                              {(() => {
                                const landed = poItemLanded[item.purchaseOrderItem] || 0;
                                return landed > 0 ? (
                                  <p className="text-[10px] text-emerald-600 mt-0.5 text-right">
                                    <span className="block">
                                      {t("page.goodsReceipt.add.table.landed")}
                                    </span>
                                    <span className="block">
                                      + Rp {landed.toLocaleString("id-ID")}
                                    </span>
                                  </p>
                                ) : null;
                              })()}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="text"
                                value={item.batchNumber || ""}
                                onChange={(e) => updateItem(idx, "batchNumber", e.target.value)}
                                className="h-8 text-xs w-24"
                                placeholder={t("page.goodsReceipt.add.placeholder.batch")}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="date"
                                value={item.expiryDate || ""}
                                onChange={(e) => updateItem(idx, "expiryDate", e.target.value)}
                                className="h-8 text-xs w-36"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="text"
                                value={item.conditionNotes}
                                onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                                className="h-8 text-xs"
                                placeholder={t("page.goodsReceipt.add.placeholder.condition")}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              {!item.isFromPo && (
                                <button
                                  type="button"
                                  onClick={() => remove(idx)}
                                  className="text-muted-foreground/30 hover:text-destructive">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("page.goodsReceipt.add.form.noPO")}
              </div>
            )}
            {errors.items?.message && (
              <p className="text-xs text-destructive">{errors.items.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("page.goodsReceipt.add.form.notesLabel")}</Label>
            {loadingPo && poId ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <Textarea
                rows={2}
                {...form.register("notes")}
                placeholder={t("page.goodsReceipt.add.placeholder.notes")}
              />
            )}
          </div>

          {grHistory.length > 0 && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <History size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("page.goodsReceipt.add.history.title", { count: grHistory.length })}
                </span>
              </div>
              <div className="space-y-1.5">
                {grHistory.map((g) => {
                  const totalQty = (g.items || []).reduce(
                    (s, it) => s + (Number(it.qtyReceived) || 0),
                    0
                  );
                  return (
                    <div key={g.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium">{g.receiptNumber}</span>
                      <span className="text-muted-foreground">
                        {g.receivedDate
                          ? new Date(g.receivedDate).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                      <span className="text-muted-foreground">
                        {totalQty.toLocaleString("id-ID")} unit
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          g.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                        {g.status === "completed"
                          ? t("page.goodsReceipt.add.history.completed")
                          : t("page.goodsReceipt.add.history.draft")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("page.goodsReceipt.add.summary.itemsReceived", { count: grSummary.count })}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    grSummary.count === 0
                      ? "bg-muted text-muted-foreground"
                      : grSummary.shortageValue > 0
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}>
                  {grSummary.count === 0
                    ? t("page.goodsReceipt.add.summary.pendingLabel")
                    : grSummary.shortageValue > 0
                      ? t("page.goodsReceipt.add.summary.mismatchLabel")
                      : t("page.goodsReceipt.add.summary.matchLabel")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {t("page.goodsReceipt.add.summary.orderedValue")}
                </span>
                <span className="font-medium">
                  Rp {grSummary.orderedValue.toLocaleString("id-ID")}
                </span>
              </div>
              {grSummary.hasPrev && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {t("page.goodsReceipt.add.summary.prevReceived")}
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    Rp {grSummary.prevValue.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {t("page.goodsReceipt.add.summary.nowReceived")}
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Rp {grSummary.nowValue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {t("page.goodsReceipt.add.summary.shortage")}
                </span>
                <span
                  className={`font-medium ${
                    grSummary.count === 0
                      ? "text-muted-foreground"
                      : grSummary.shortageValue > 0
                        ? "text-red-500"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                  {grSummary.shortageValue > 0
                    ? `Rp ${grSummary.shortageValue.toLocaleString("id-ID")}`
                    : t("page.goodsReceipt.add.status.selesai")}
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold">{t("page.goodsReceipt.add.summary.variance")}</span>
                <span
                  className={`font-bold text-base ${
                    grSummary.count === 0
                      ? "text-muted-foreground"
                      : grSummary.shortageValue > 0
                        ? "text-red-500"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                  {grSummary.shortageValue > 0
                    ? `-Rp ${grSummary.shortageValue.toLocaleString("id-ID")}`
                    : "Rp 0"}
                </span>
              </div>
              {grSummary.shortageValue > 0 && poId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                  onClick={() => navigate(`/purchase-order/detail?id=${poId}`)}>
                  <RotateCcw size={14} />
                  {t("page.goodsReceipt.add.summary.createReturnCta")}
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto justify-center"
              onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.goodsReceipt.add.form.cancel")}
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto justify-center"
                onClick={() => setDraftModal(true)}
                disabled={isSubmitting}>
                {t("common.saveAsDraft")}
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto justify-center"
                disabled={isSubmitting || items.length === 0}
                onClick={async () => {
                  const ok = await trigger();
                  if (!ok) return;
                  setConfirmModal(true);
                }}>
                <Save size={16} className="mr-1" />{" "}
                {isSubmitting
                  ? t("page.goodsReceipt.add.form.saving")
                  : t("page.goodsReceipt.add.form.save")}
              </Button>
            </div>
          </div>
        </form>

        {isSubmitting && (
          <Loading fullscreen size="lg" label={t("page.goodsReceipt.add.form.saving")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.goodsReceipt.add.modal.title")}
          description={t("page.goodsReceipt.add.modal.description")}
          confirmText={t("page.goodsReceipt.add.modal.confirm")}
          onConfirm={() => {
            setCancelModal(false);
            setTimeout(() => navigate("/goods-receipt"), 150);
          }}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title={t("common.saveAsDraftTitle")}
          description={t("common.saveAsDraftDesc")}
          confirmText={t("common.yesSaveDraft")}
          onConfirm={() => {
            setDraftModal(false);
            doSubmit(getValues(), true);
          }}
        />
        <Modal
          type="confirm"
          open={confirmModal}
          onOpenChange={setConfirmModal}
          title={t("page.goodsReceipt.add.confirmModal.title")}
          description={t("page.goodsReceipt.add.confirmModal.description")}
          confirmText={t("page.goodsReceipt.add.confirmModal.confirm")}
          onConfirm={() => {
            setConfirmModal(false);
            doSubmit(getValues(), false);
          }}
        />
        <Modal
          type="error"
          open={errorModal}
          onOpenChange={setErrorModal}
          title={t("common.error")}
          description={modalMessage}
          onConfirm={() => setErrorModal(false)}
        />
      </div>
    </>
  );
};

export default AddGoodsReceipt;
