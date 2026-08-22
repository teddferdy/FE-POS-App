import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { Save, X, Trash2, Package, Lightbulb, Search, ImagePlus, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { editGoodsReceipt, getGoodsReceiptById } from "@/services/goods-receipt";
import { getAllPurchaseOrder, getPurchaseOrderById } from "@/services/purchase-order";
import { getAllIngredients } from "@/services/ingredient";
import { getAllEmployee } from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { z } from "zod";
import { Combobox } from "@/components/ui/combobox";
import Modal from "@/components/organism/modal";
import AbortController from "@/components/organism/abort-controller";
import PageHeader from "@/components/ui/PageHeader";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";
import { Loading } from "@/components/ui/loading";

const EditGoodsReceipt = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const id = searchParams.get("id");

  const [poId, setPoId] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ingredientFocusIdx, setIngredientFocusIdx] = useState(null);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [picSearch, setPicSearch] = useState("");
  const [picOpen, setPicOpen] = useState(false);
  const [selectedPic, setSelectedPic] = useState(null);
  const picRef = useRef(null);
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (picRef.current && !picRef.current.contains(e.target)) {
        setPicOpen(false);
        setPicSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fieldLabels = {
    poId: t("page.goodsReceipt.edit.form.purchaseOrder"),
    items: t("page.goodsReceipt.edit.form.items")
  };

  const formSchema = z.object({
    poId: z.string().min(1),
    items: z.array(z.any()).min(1)
  });

  const {
    data: receiptData,
    isLoading: loadingReceipt,
    isError,
    refetch
  } = useQuery(["goods-receipt-edit", id], () => getGoodsReceiptById(id), { enabled: !!id });

  const { data: poData } = useQuery(
    ["pos-for-gr-edit"],
    () => getAllPurchaseOrder({ limit: 50 }),
    {}
  );
  const purchaseOrders = poData?.data || [];

  const selectedPO = purchaseOrders.find((po) => po.id === parseInt(poId));
  const storeId = selectedPO?.store || receiptData?.data?.store;

  const { data: ingredientsData } = useQuery(
    ["ingredients-gr-edit", storeId],
    () => getAllIngredients({ store: storeId, limit: 999 }),
    { enabled: !!storeId }
  );
  const ingredients = ingredientsData?.data || [];
  const activeIngredients = ingredients.filter((i) => i.status === "active");

  const getFilteredIngredients = (search) =>
    activeIngredients.filter((i) => i.name?.toLowerCase().includes((search || "").toLowerCase()));

  useEffect(() => {
    const receipt = receiptData?.data;
    if (!receipt || loaded) return;
    setPoId(receipt.purchaseOrderId || "");
    setReceivedDate(receipt.receivedDate ? new Date(receipt.receivedDate) : new Date());
    setNotes(receipt.notes || "");
    if (receipt.picData) {
      setSelectedPic({
        id: receipt.picData.id,
        fullName: receipt.picData.fullName,
        userName: receipt.picData.userName
      });
    }
    if (receipt.documentation) setDocPreview(receipt.documentation);
    if (receipt.items) {
      setItems(
        receipt.items.map((item) => ({
          id: item.id,
          purchaseOrderItem: item.purchaseOrderItem || null,
          ingredient: item.product || null,
          ingredientName: item.ingredientName || item.productData?.nameProduct || "",
          product: item.product || null,
          qty: item.qty || item.qtyReceived || 0,
          unit: item.unit || "pcs",
          qtyReceived: String(item.qtyReceived || 0),
          conditionNotes: item.conditionNotes || "",
          costPrice: item.costPrice || 0,
          conversionToBase: item.conversionToBase || 1,
          isFromPo: true
        }))
      );
    }
    setLoaded(true);
  }, [receiptData, loaded]);

  const { data: poDetail, isLoading: loadingPo } = useQuery(
    ["po-detail-edit", poId],
    () => getPurchaseOrderById(poId),
    { enabled: !!poId }
  );

  useEffect(() => {
    if (!poDetail?.data?.items) return;
    const poItems = poDetail.data.items;
    if (items.length === 0 && !loaded) {
      setItems(
        poItems.map((item) => ({
          purchaseOrderItem: item.id,
          ingredient: item.ingredient || null,
          ingredientName: item.ingredientName || item.ingredientData?.name || "",
          product: item.product || null,
          qty: item.quantity,
          unit: item.unit || "pcs",
          qtyReceived: "0",
          conditionNotes: "",
          costPrice: item.price || 0,
          conversionToBase: item.conversionToBase || 1,
          isFromPo: true
        }))
      );
    } else if (loaded && items.length > 0) {
      setItems((prev) =>
        prev.map((it) => {
          const poItem = poItems.find(
            (p) =>
              (p.ingredientName || p.ingredientData?.name) === it.ingredientName ||
              (p.ingredient || p.product) === (it.ingredient || it.product)
          );
          return poItem ? { ...it, qty: poItem.quantity } : it;
        })
      );
    }
  }, [poDetail, items.length, loaded]);

  const grStoreId = receiptData?.data?.store || selectedPO?.store;
  const { data: employeesData } = useQuery(
    ["employees-for-gr-edit", grStoreId],
    () => getAllEmployee({ limit: 999, status: "active", location: grStoreId || undefined }),
    { enabled: !!grStoreId }
  );
  const employees = employeesData?.data || [];
  const filteredEmployees = employees.filter((e) =>
    (e.fullName || e.userName)?.toLowerCase().includes(picSearch.toLowerCase())
  );

  // Max qty per line when editing: PO ordered minus received by OTHER receipts
  // (this receipt's own previous contribution is reversed on save)
  const getItemRemaining = (item) => {
    if (!item.isFromPo && !item.purchaseOrderItem) return Math.max(0, Number(item.qty) || 0);
    const poItems = poDetail?.data?.items || [];
    const poItem =
      poItems.find((p) => p.id === item.purchaseOrderItem) ||
      (!item.purchaseOrderItem
        ? poItems.find((p) => (p.ingredientName || p.ingredientData?.name) === item.ingredientName)
        : null);
    if (!poItem) return Math.max(0, Number(item.qty) || 0);
    const ownPrevItem = (receiptData?.data?.items || []).find(
      (ri) =>
        ri.purchaseOrderItem === poItem.id ||
        (!ri.purchaseOrderItem && ri.ingredientName === item.ingredientName)
    );
    const ownPrev = ownPrevItem ? Number(ownPrevItem.qtyReceived) || 0 : 0;
    return Math.max(0, Number(poItem.quantity) - (Number(poItem.receivedQuantity) || 0) + ownPrev);
  };

  const grSummary = items.reduce(
    (acc, it) => {
      if (!(it.ingredientName || it.ingredient)) return acc;
      const price = parseFloat(it.costPrice) || 0;
      const poList = poDetail?.data?.items || [];
      const poItem =
        poList.find((p) => p.id === it.purchaseOrderItem) ||
        (!it.purchaseOrderItem
          ? poList.find((p) => (p.ingredientName || p.ingredientData?.name) === it.ingredientName)
          : null);
      const ownPrevItem = poItem
        ? (receiptData?.data?.items || []).find(
            (ri) =>
              ri.purchaseOrderItem === poItem.id ||
              (!ri.purchaseOrderItem && ri.ingredientName === it.ingredientName)
          )
        : null;
      const ownPrev = ownPrevItem ? Number(ownPrevItem.qtyReceived) || 0 : 0;
      const qtyPo = poItem
        ? Math.max(0, Number(poItem.quantity) || 0)
        : Math.max(0, Number(it.qty) || 0);
      const othersPrev = poItem ? Math.max(0, (Number(poItem.receivedQuantity) || 0) - ownPrev) : 0;
      const remaining = Math.max(getItemRemaining(it), 0);
      const now = Math.min(Math.max(parseFloat(it.qtyReceived) || 0, 0), remaining);
      acc.target += remaining;
      acc.filled += now;
      if (now > 0) acc.count += 1;
      acc.orderedValue += qtyPo * price;
      acc.prevValue += othersPrev * price;
      acc.nowValue += now * price;
      acc.shortageValue += Math.max(qtyPo - othersPrev - now, 0) * price;
      if (othersPrev > 0) acc.hasPrev = true;
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
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error(t("page.goodsReceipt.add.form.fileTooLarge"));
      e.target.value = "";
      return;
    }
    setDocFile(f);
    setDocPreview(URL.createObjectURL(f));
  };

  const clearDoc = () => {
    setDocFile(null);
    setDocPreview(null);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => (i !== idx ? item : { ...item, [field]: value })));
  };

  const doSubmit = async (saveAsDraft = false) => {
    if (!poId || items.length === 0) {
      toast.error(t("page.goodsReceipt.edit.toast.validation"), {
        description: t("page.goodsReceipt.edit.toast.poRequired")
      });
      return;
    }
    const validItems = items.filter(
      (it) => parseFloat(it.qtyReceived) > 0 && (it.ingredientName || it.ingredient)
    );
    if (validItems.length === 0) {
      toast.error(t("page.goodsReceipt.edit.toast.validation"), {
        description: t("page.goodsReceipt.edit.toast.itemRequired")
      });
      return;
    }
    const overItem = validItems.find((it) => parseFloat(it.qtyReceived) > getItemRemaining(it));
    if (overItem) {
      toast.error(t("page.goodsReceipt.edit.toast.validation"), {
        description: t("page.goodsReceipt.add.toast.qtyExceed")
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        receivedDate:
          receivedDate instanceof Date ? receivedDate.toISOString().split("T")[0] : receivedDate,
        notes,
        pic: selectedPic?.id || null,
        status: saveAsDraft ? "draft" : "completed",
        items: validItems.map((it) => ({
          purchaseOrderItem: it.purchaseOrderItem || null,
          ingredient: it.ingredient,
          ingredientName: it.ingredientName,
          product: it.product,
          qtyReceived: parseFloat(it.qtyReceived),
          unit: it.unit,
          conditionNotes: it.conditionNotes,
          costPrice: parseFloat(it.costPrice) || 0,
          conversionToBase: parseFloat(it.conversionToBase) || 1
        }))
      };
      if (!docFile) payload.documentation = docPreview || null;
      await editGoodsReceipt(id, payload, docFile);
      toast.success(t("page.goodsReceipt.edit.toast.success"), {
        description: t("page.goodsReceipt.edit.toast.successDesc")
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

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.goodsReceipt.edit.notFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (loadingReceipt) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          breadcrumbs={[
            { label: t("breadcrumb.dashboard"), href: "/dashboard-super-admin" },
            { label: t("breadcrumb.goodsReceipt"), href: "/goods-receipt" },
            { label: t("breadcrumb.edit") }
          ]}
          title={t("page.goodsReceipt.edit.title")}
          description={t("page.goodsReceipt.edit.description")}
          backLink="/goods-receipt"
        />
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex justify-between pt-4 border-t">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <PageHeader
          breadcrumbs={[
            {
              label: t("breadcrumb.dashboard"),
              href: "/dashboard-super-admin",
              i18nKey: "breadcrumb.dashboard"
            },
            {
              label: t("breadcrumb.goodsReceipt"),
              href: "/goods-receipt",
              i18nKey: "breadcrumb.goodsReceipt"
            },
            { label: t("breadcrumb.edit"), i18nKey: "breadcrumb.edit" }
          ]}
          title={t("page.goodsReceipt.edit.title")}
          description={t("page.goodsReceipt.edit.description")}
          backLink="/goods-receipt"
          onBack={() => setCancelModal(true)}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSubmit(false);
          }}
          className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t("page.goodsReceipt.edit.form.purchaseOrder")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={[
                  { value: "", label: t("page.goodsReceipt.edit.form.selectPO") },
                  ...purchaseOrders.map((po) => ({
                    value: po.id,
                    label: po.orderNumber
                  }))
                ]}
                value={poId}
                disabled
                placeholder={t("page.goodsReceipt.edit.form.selectPO")}
                searchPlaceholder={t("common.search")}
              />
              {selectedPO && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.edit.form.status")}: {selectedPO.status}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">
                    {t("page.goodsReceipt.edit.form.store")}: {selectedPO.storeData?.name || "-"}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("page.goodsReceipt.edit.form.receivedDate")}</Label>
              <DatePicker date={receivedDate} setDate={setReceivedDate} />
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
                ref={docInputRef}
                className="hidden"
                onChange={handleDocChange}
              />
              <div
                onClick={() => docInputRef.current?.click()}
                className="relative rounded-lg border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center bg-muted/30 overflow-hidden cursor-pointer group min-h-[88px]">
                {docPreview ? (
                  <>
                    <img
                      src={docPreview}
                      alt={t("page.goodsReceipt.add.form.documentation")}
                      className="w-full h-auto max-h-40 object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDoc();
                      }}
                      className="absolute top-2 right-2 z-10 p-2 bg-background/90 rounded-full text-muted-foreground hover:text-destructive shadow-md">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors px-4 py-5">
                    <CloudUpload size={28} />
                    <span className="text-sm font-semibold">
                      {t("page.goodsReceipt.add.form.docClick")}
                    </span>
                    <ImagePlus size={16} className="opacity-50" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("page.goodsReceipt.add.form.docHint")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{t("page.goodsReceipt.edit.form.items")}</Label>
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
            {loadingPo ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {t("page.goodsReceipt.edit.loading.items")}
              </div>
            ) : poId ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b">
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.name")}
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.qtyPo")}
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.unit")}
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.add.table.conversion")}
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.qtyReceived")}
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.add.table.costPrice")}
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs">
                        {t("page.goodsReceipt.edit.table.notes")}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-muted/20">
                        <td className="px-3 py-2">
                          {item.isFromPo ? (
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium">{item.ingredientName}</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <Input
                                type="text"
                                value={item.ingredientName}
                                onChange={(e) => {
                                  updateItem(idx, "ingredientName", e.target.value);
                                  updateItem(idx, "ingredient", null);
                                  setIngredientFocusIdx(idx);
                                }}
                                onFocus={() => setIngredientFocusIdx(idx)}
                                onBlur={() => setTimeout(() => setIngredientFocusIdx(null), 200)}
                                className="h-8 text-xs"
                                placeholder={t("page.goodsReceipt.edit.placeholder.name")}
                              />
                              {ingredientFocusIdx === idx && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {getFilteredIngredients(item.ingredientName || "").length > 0 ? (
                                    getFilteredIngredients(item.ingredientName || "").map((ing) => (
                                      <button
                                        key={ing.id}
                                        type="button"
                                        onMouseDown={() => {
                                          updateItem(idx, "ingredientName", ing.name);
                                          updateItem(idx, "ingredient", ing.id);
                                          updateItem(idx, "unit", ing.unit || "pcs");
                                          setIngredientFocusIdx(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2">
                                        <span>{ing.name}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                          {ing.unit || "pcs"}
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="p-3 text-xs text-muted-foreground text-center">
                                      {t("page.goodsReceipt.edit.placeholder.noIngredient") ||
                                        "Tidak ada bahan ditemukan"}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.isFromPo ? (
                            <span className="text-sm text-muted-foreground">{item.qty}</span>
                          ) : (
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={item.qty || ""}
                              onChange={(e) =>
                                updateItem(idx, "qty", e.target.value.replace(/[^0-9]/g, ""))
                              }
                              className="h-8 text-xs text-center w-16 mx-auto"
                              placeholder={t("page.goodsReceipt.edit.placeholder.qty")}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center">
                            {item.isFromPo ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs bg-muted capitalize">
                                {item.unit}
                              </span>
                            ) : (
                              <Combobox
                                options={[
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
                                ]}
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
                                value={item.conversionToBase ? String(item.conversionToBase) : "1"}
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
                            placeholder={t("page.goodsReceipt.edit.placeholder.qty")}
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
                                e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                              )
                            }
                            className="h-8 text-xs text-right w-28 ml-auto"
                            placeholder={t("page.goodsReceipt.add.placeholder.costPrice")}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="text"
                            value={item.conditionNotes}
                            onChange={(e) => updateItem(idx, "conditionNotes", e.target.value)}
                            className="h-8 text-xs"
                            placeholder={t("page.goodsReceipt.edit.placeholder.condition")}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {!item.isFromPo && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-muted-foreground/30 hover:text-destructive">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t("page.goodsReceipt.edit.form.noPO")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("page.goodsReceipt.edit.form.notesLabel")}</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.goodsReceipt.edit.placeholder.notes")}
            />
          </div>

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
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto justify-center"
              onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.goodsReceipt.edit.form.cancel")}
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto justify-center"
                onClick={() => setDraftModal(true)}
                disabled={isSubmitting}>
                Simpan sebagai Draft
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto justify-center"
                disabled={isSubmitting || items.length === 0}
                onClick={() => {
                  const missing = getMissingFields({ poId, items }, formSchema, fieldLabels);
                  if (missing.length > 0) {
                    setMissingFields(missing);
                    setMissingFieldsModal(true);
                    return;
                  }
                  setConfirmModal(true);
                }}>
                <Save size={16} className="mr-1" />{" "}
                {isSubmitting
                  ? t("page.goodsReceipt.edit.form.saving")
                  : t("page.goodsReceipt.edit.form.save")}
              </Button>
            </div>
          </div>
        </form>

        {isSubmitting && (
          <Loading fullscreen size="lg" label={t("page.goodsReceipt.edit.form.saving")} />
        )}

        <Modal
          type="confirm"
          open={cancelModal}
          onOpenChange={(o) => !o && setCancelModal(false)}
          title={t("page.goodsReceipt.edit.modal.title")}
          description={t("page.goodsReceipt.edit.modal.description")}
          confirmText={t("page.goodsReceipt.edit.modal.confirm")}
          onConfirm={() => {
            setCancelModal(false);
            setTimeout(() => navigate("/goods-receipt"), 150);
          }}
        />
        <Modal
          type="confirm"
          open={draftModal}
          onOpenChange={setDraftModal}
          title="Simpan sebagai Draft"
          description="Data akan disimpan sebagai draft"
          confirmText="Ya, Simpan"
          onConfirm={() => {
            setDraftModal(false);
            doSubmit(true);
          }}
        />
        <Modal
          type="confirm"
          open={confirmModal}
          onOpenChange={setConfirmModal}
          title={t("page.goodsReceipt.edit.confirmModal.title")}
          description={t("page.goodsReceipt.edit.confirmModal.description")}
          confirmText={t("page.goodsReceipt.edit.confirmModal.confirm")}
          onConfirm={() => {
            setConfirmModal(false);
            doSubmit(false);
          }}
        />
        <MissingFieldsModal
          open={missingFieldsModal}
          onOpenChange={setMissingFieldsModal}
          fields={missingFields}
        />
        <Modal
          type="error"
          open={errorModal}
          onOpenChange={setErrorModal}
          title={t("common.error")}
          description={modalMessage}
          onConfirm={() => setErrorModal(false)}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb size={16} className="text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("page.goodsReceipt.edit.tips.title")}
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                  {t("page.goodsReceipt.edit.tips.3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditGoodsReceipt;
