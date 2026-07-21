import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Check, Plus, Trash2, Upload, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { Switch } from "@/components/ui/switch";
import { addSupplier } from "@/services/supplier";
import { downloadSupplierProductTemplate, importSupplierProducts } from "@/services/supplier";
import { getAllLocation } from "@/services/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import StoreSelectCard from "@/components/organism/StoreSelectCard";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import UserGuide from "@/components/organism/UserGuide";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";
import { Loading } from "@/components/ui/loading";

const AddSupplier = () => {
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("page.supplier.validation.nameRequired")),
    contactPerson: z.string().optional().or(z.literal("")),
    phone: z.string().min(1, t("page.supplier.validation.phoneRequired")).max(14),
    email: z
      .string()
      .email(t("page.supplier.validation.emailInvalid"))
      .optional()
      .or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    store: z.string().optional()
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";
  const supplierFieldLabels = {
    name: t("page.supplier.form.name"),
    phone: t("page.supplier.form.phone")
  };

  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);
  const [missingFieldsModal, setMissingFieldsModal] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [confirmSaveModal, setConfirmSaveModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [selectedStore, setSelectedStore] = useState([]);
  const [allStores, setAllStores] = useState(false);

  // --- Products Supplied state ---
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productLeadTime, setProductLeadTime] = useState("");
  const [productQualityRating, setProductQualityRating] = useState("");
  const [productMinOrderQty, setProductMinOrderQty] = useState("");
  const [excelFile, setExcelFile] = useState(null);

  const {
    data: locationsData,
    isLoading: locsLoading,
    isFetching: locsFetching
  } = useQuery(["allLocations"], () => getAllLocation(), { enabled: isSuperAdmin });
  const locations = locationsData?.data || locationsData?.locations || [];

  const excelImportMutation = useMutation(({ id, file }) => importSupplierProducts({ id, file }), {
    onSuccess: (data) => {
      const imported = (data?.data || data?.products || []).map((p) => ({
        id: p.id || `imported_${Date.now()}`,
        name: p.name || p.productName || "",
        price: p.price || 0,
        leadTime: p.leadTime || 0,
        qualityRating: p.qualityRating || 0,
        minOrderQty: p.minOrderQty || 1
      }));
      setSupplierProducts((prev) => [...prev, ...imported]);
      toast.success(t("page.supplier.products.importSuccess"));
      setExcelFile(null);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.products.importFailed")
      });
    }
  });

  const handleAddManualProduct = () => {
    if (!newProductName.trim() || !productPrice) return;
    const newProduct = {
      id: `manual_${Date.now()}`,
      name: newProductName.trim(),
      price: Number(productPrice),
      leadTime: Number(productLeadTime) || 0,
      qualityRating: Number(productQualityRating) || 0,
      minOrderQty: Number(productMinOrderQty) || 1
    };
    setSupplierProducts((prev) => [...prev, newProduct]);
    setNewProductName("");
    setProductPrice("");
    setProductLeadTime("");
    setProductQualityRating("");
    setProductMinOrderQty("");
    setShowManualAdd(false);
  };

  const handleRemoveProduct = (id) => {
    setSupplierProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadSupplierProductTemplate();
      toast.success(t("common.success"), {
        description: t("page.supplier.products.templateDownloaded")
      });
    } catch (err) {
      toast.error(t("common.error"), {
        description: err?.message || t("page.supplier.products.templateFailed")
      });
    }
  };

  const handleExcelImport = () => {
    if (!excelFile) return;
    excelImportMutation.mutate({ id: "preview", file: excelFile });
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      isActive: true
    }
  });

  const createMutation = useMutation(addSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.toast.addFailed")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    if (isSuperAdmin && !allStores && selectedStore.length === 0 && !saveAsDraft) {
      form.setError("store", {
        message: t("page.supplier.validation.storeRequired") || "Pilih minimal satu toko"
      });
      return;
    }
    form.clearErrors("store");
    let statusValue;
    if (saveAsDraft) {
      statusValue = "draft";
    } else {
      statusValue = values.isActive ? "active" : "inactive";
    }
    createMutation.mutate({
      ...values,
      status: statusValue,
      store: selectedStore,
      products: supplierProducts.map((p) => ({
        name: p.name,
        price: p.price,
        leadTime: p.leadTime || 0,
        qualityRating: p.qualityRating || 0,
        minOrderQty: p.minOrderQty || 1
      }))
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
          <PageHeader
            breadcrumbs={[
              {
                label: t("breadcrumb.home"),
                href: "/dashboard-super-admin",
                i18nKey: "breadcrumb.home"
              },
              {
                label: t("breadcrumb.supplier"),
                href: "/supplier",
                i18nKey: "breadcrumb.supplier"
              },
              { label: t("page.supplier.add.title"), i18nKey: "page.supplier.add.title" }
            ]}
            title={t("page.supplier.add.title")}
            description={t("page.supplier.add.description")}>
            <UserGuide guideKey="add-supplier" />
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <div className="space-y-6">
            <Card className="p-6">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="space-y-6">
                  {isSuperAdmin && (
                    <FormField
                      control={form.control}
                      name="store"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <StoreSelectCard
                              locations={locations}
                              selectedStores={selectedStore}
                              onChange={(stores) => {
                                setSelectedStore(stores);
                                form.clearErrors("store");
                              }}
                              isSuperAdmin={isSuperAdmin}
                              user={user}
                              t={t}
                              title={t("page.supplier.form.storeSection.title")}
                              description={t("page.supplier.form.storeSection.desc")}
                              noStoreLabel={t("page.supplier.form.storeSection.noStore")}
                              addStoreLabel={t("page.supplier.form.storeSection.addStore")}
                              storeInfoLabel={t("page.supplier.form.storeInfo")}
                              allStores={allStores}
                              onAllStoresChange={(val) => {
                                setAllStores(val);
                                form.clearErrors("store");
                              }}
                              navigate={navigate}
                              mandatory={true}
                              locationsLoading={locsLoading || locsFetching}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("page.supplier.form.name")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Input placeholder={t("page.supplier.form.namePlaceholder")} {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("page.supplier.form.contactPerson")}</FormLabel>
                          <Input
                            placeholder={t("page.supplier.form.contactPersonPlaceholder")}
                            {...field}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("page.supplier.form.phone")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Input
                            placeholder={t("page.supplier.form.phonePlaceholder")}
                            inputMode="numeric"
                            maxLength={14}
                            {...field}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 14);
                              field.onChange(v);
                            }}
                          />
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">{t("common.phoneHint")}</p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("page.supplier.form.email")}</FormLabel>
                          <Input
                            placeholder={t("page.supplier.form.emailPlaceholder")}
                            {...field}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("page.supplier.form.address")}</FormLabel>
                        <Textarea
                          placeholder={t("page.supplier.form.addressPlaceholder")}
                          rows={3}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("page.supplier.form.status")}
                    </h3>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        form.watch("isActive")
                          ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            form.watch("isActive")
                              ? "bg-green-600 text-secondary"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                          {form.watch("isActive") ? (
                            <Check size={20} />
                          ) : (
                            <span className="text-lg font-bold">⏻</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {form.watch("isActive") ? t("common.active") : t("common.inactive")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {form.watch("isActive")
                              ? t("page.supplier.form.activeDescription")
                              : t("page.supplier.form.inactiveDescription")}
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
              <Modal
                type="confirm"
                open={confirmSaveModal}
                onOpenChange={setConfirmSaveModal}
                title={t("page.supplier.modal.confirmSave")}
                description={t("page.supplier.modal.confirmSaveDesc")}
                confirmText={t("page.supplier.modal.confirmSaveText")}
                onConfirm={() => {
                  setConfirmSaveModal(false);
                  const values = form.getValues();
                  onSubmit(values);
                }}
              />
              <MissingFieldsModal
                open={missingFieldsModal}
                onOpenChange={setMissingFieldsModal}
                fields={missingFieldsList}
              />
              <Modal
                type="confirm"
                open={!!deleteProductId}
                onOpenChange={() => setDeleteProductId(null)}
                title={t("page.supplier.products.confirmDelete")}
                description={t("page.supplier.products.confirmDeleteDesc")}
                confirmText={t("common.delete")}
                onConfirm={() => {
                  handleRemoveProduct(deleteProductId);
                  setDeleteProductId(null);
                }}
              />
            </Card>

            {isSuperAdmin && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("page.supplier.products.title")}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setShowManualAdd(!showManualAdd);
                        setShowExcelImport(false);
                      }}>
                      <Plus size={14} />
                      {t("page.supplier.products.addProduct")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setShowExcelImport(!showExcelImport);
                        setShowManualAdd(false);
                      }}>
                      <Upload size={14} />
                      {t("page.supplier.products.importExcel")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleDownloadTemplate}>
                      <Download size={14} />
                      {t("page.supplier.products.downloadTemplate")}
                    </Button>
                  </div>
                </div>

                {showManualAdd && (
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <Input
                      placeholder={t("page.supplier.products.searchPlaceholder")}
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Harga"
                        className="pl-9"
                        value={productPrice ? Number(productPrice).toLocaleString("id-ID") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setProductPrice(raw);
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Lead Time (hari)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={productLeadTime}
                          onChange={(e) => setProductLeadTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Kualitas (0-5)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="5"
                          step="0.5"
                          value={productQualityRating}
                          onChange={(e) => setProductQualityRating(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Min Order</label>
                        <Input
                          type="number"
                          placeholder="1"
                          min="1"
                          value={productMinOrderQty}
                          onChange={(e) => setProductMinOrderQty(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newProductName.trim() || !productPrice}
                      onClick={handleAddManualProduct}
                      className="w-full gap-1.5">
                      <Plus size={14} />
                      {t("page.supplier.products.add")}
                    </Button>
                  </div>
                )}

                {showExcelImport && (
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleDownloadTemplate}>
                      <Download size={14} />
                      {t("page.supplier.products.downloadTemplate")}
                    </Button>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={!excelFile || excelImportMutation.isLoading}
                      onClick={handleExcelImport}
                      className="w-full gap-1.5">
                      <Upload size={14} />
                      {excelImportMutation.isLoading
                        ? t("common.loading")
                        : t("page.supplier.products.upload")}
                    </Button>
                  </div>
                )}

                {supplierProducts.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                            {t("page.supplier.products.table.name")}
                          </th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                            {t("page.supplier.products.table.price")}
                          </th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                            Lead Time
                          </th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                            Kualitas
                          </th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                            Min Order
                          </th>
                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                            {t("page.supplier.products.table.action")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierProducts.map((p) => (
                          <tr key={p.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{p.name}</td>
                            <td className="px-3 py-2 text-right">
                              {Number(p.price).toLocaleString("id-ID")}
                            </td>
                            <td className="px-3 py-2 text-right">{p.leadTime || 0} hari</td>
                            <td className="px-3 py-2 text-right">{p.qualityRating || 0}</td>
                            <td className="px-3 py-2 text-right">{p.minOrderQty || 1}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteProductId(p.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("page.supplier.products.empty")}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            {t("common.cancel")}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDraftModal(true)}
              disabled={createMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {t("page.supplier.form.saveAsDraft")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const values = form.getValues();
                const extraErrors = [];
                if (isSuperAdmin && !allStores && selectedStore.length === 0) {
                  extraErrors.push({ name: "store", message: "required" });
                }
                const missing = getMissingFields(
                  values,
                  formSchema,
                  supplierFieldLabels,
                  extraErrors
                );
                if (missing.length > 0) {
                  setMissingFieldsList(missing);
                  setMissingFieldsModal(true);
                  return;
                }
                setConfirmSaveModal(true);
              }}
              disabled={createMutation.isLoading}
              className="gap-2">
              <Save size={18} />
              {createMutation.isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>
      </div>

      {createMutation.isLoading && (
        <Loading fullscreen size="lg" label={t("page.product.form.saving")} />
      )}

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.supplier.modal.cancelTitle")}
        description={t("page.supplier.modal.cancelDescription")}
        confirmText={t("page.supplier.modal.confirmCancel")}
        onConfirm={() => navigate("/supplier")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("common.success")}
        description={t("page.supplier.toast.addSuccess")}
        confirmText={t("page.supplier.modal.backToList")}
        onConfirm={() => navigate("/supplier")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.supplier.modal.draftTitle")}
        description={t("page.supplier.modal.draftDescription")}
        confirmText={t("page.supplier.modal.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default AddSupplier;
