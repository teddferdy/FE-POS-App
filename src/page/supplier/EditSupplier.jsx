import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Save, Store, Check, Plus, Trash2, Upload, Download } from "lucide-react";
import { useCookies } from "react-cookie";
import { Switch } from "@/components/ui/switch";
import {
  editSupplier,
  getSupplierById,
  downloadSupplierProductTemplate,
  importSupplierProducts
} from "@/services/supplier";
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
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import UserGuide from "@/components/organism/UserGuide";
import MissingFieldsModal from "@/components/organism/MissingFieldsModal";
import { getMissingFields } from "@/lib/validation";
import AbortController from "@/components/organism/abort-controller";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

const EditSupplier = () => {
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
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("id");
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
  const [selectedStore, setSelectedStore] = useState([]);
  const [allStores, setAllStores] = useState(false);
  const [cookie] = useCookies();
  const user = cookie?.user;
  const isSuperAdmin = user?.roleType === "super_admin";

  // Supplier Products state
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [showImportExcel, setShowImportExcel] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const {
    data: locationsData,
    isLoading: locsLoading,
    isFetching: locsFetching
  } = useQuery(["allLocations"], () => getAllLocation(), { enabled: isSuperAdmin });
  const locations = locationsData?.data || locationsData?.locations || [];

  const {
    data: supplierData,
    isLoading,
    isError,
    refetch
  } = useQuery(["supplier-detail", supplierId], () => getSupplierById({ id: supplierId }), {
    enabled: !!supplierId
  });

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

  const supplier = supplierData?.data || {};

  useEffect(() => {
    if (supplier?.id) {
      form.reset({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        isActive: supplier.status === "active" || supplier.status === true
      });
      if (supplier.store) {
        const storeArr = Array.isArray(supplier.store) ? supplier.store : [];
        if (storeArr.length === 0) {
          setAllStores(true);
          setSelectedStore([]);
        } else {
          setAllStores(false);
          setSelectedStore(storeArr.map((s) => (typeof s === "object" ? s.id : s)));
        }
      }
      if (supplier.products && Array.isArray(supplier.products)) {
        setSupplierProducts(
          supplier.products.map((p) => ({ id: p.id, name: p.name, price: p.price }))
        );
      }
    }
  }, [supplier, form]);

  const updateMutation = useMutation(editSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description:
          err?.response?.data?.message || err.message || t("page.supplier.toast.updateError")
      });
    }
  });

  const importMutation = useMutation(importSupplierProducts, {
    onSuccess: () => {
      toast.success(t("common.success"), { description: "Produk berhasil diimport" });
      setShowImportExcel(false);
      setImportFile(null);
      refetch();
    },
    onError: (err) => {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || err.message || "Gagal import produk"
      });
    }
  });

  const handleAddProduct = () => {
    if (!newProductName.trim()) {
      toast.error(t("common.error"), { description: "Masukkan nama produk" });
      return;
    }
    if (!productPrice || Number(productPrice) <= 0) {
      toast.error(t("common.error"), { description: "Masukkan harga yang valid" });
      return;
    }
    setSupplierProducts((prev) => [
      ...prev,
      { id: `manual_${Date.now()}`, name: newProductName.trim(), price: Number(productPrice) }
    ]);
    setNewProductName("");
    setProductPrice("");
    setShowAddProduct(false);
  };

  const handleRemoveProduct = (productId) => {
    setSupplierProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadSupplierProductTemplate();
    } catch (err) {
      toast.error(t("common.error"), { description: "Gagal download template" });
    }
  };

  const handleImportExcel = () => {
    if (!importFile) {
      toast.error(t("common.error"), { description: "Pilih file terlebih dahulu" });
      return;
    }
    importMutation.mutate({ id: supplierId, file: importFile });
  };

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
    updateMutation.mutate({
      id: supplierId,
      ...values,
      status: statusValue,
      store: selectedStore,
      products: supplierProducts
    });
  };

  if (!supplierId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.supplier.edit.notFound")}</p>
      </div>
    );
  }

  if (isError) return <AbortController refetch={refetch} />;

  if (isLoading) {
    return <Loading fullscreen size="lg" label={t("common.loading")} />;
  }

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
              { label: t("breadcrumb.editSupplier"), i18nKey: "breadcrumb.editSupplier" }
            ]}
            title={t("page.supplier.edit.title")}
            description={t("page.supplier.edit.description")}
            backLink="/supplier">
            <UserGuide guideKey="add-supplier" />
          </PageHeader>
        </div>
      </div>

      <div>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                                title={t("page.category.form.storeSection.title")}
                                description={t("page.category.form.storeSection.desc")}
                                noStoreLabel={t("page.category.form.storeSection.noStore")}
                                addStoreLabel={t("page.category.form.storeSection.addStore")}
                                storeInfoLabel={t("page.category.form.storeInfo")}
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
                            <Input
                              placeholder={t("page.supplier.form.namePlaceholder")}
                              {...field}
                            />
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
                  </form>
                </Form>
                <Modal
                  type="confirm"
                  open={confirmSaveModal}
                  onOpenChange={setConfirmSaveModal}
                  title="Konfirmasi Simpan"
                  description="Apakah Anda yakin ingin menyimpan data ini?"
                  confirmText="Ya, Simpan"
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
              </Card>

              {isSuperAdmin && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Produk yang Disediakan
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setShowAddProduct(!showAddProduct);
                          setShowImportExcel(false);
                        }}>
                        <Plus size={14} />
                        Tambah Produk
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setShowImportExcel(!showImportExcel);
                          setShowAddProduct(false);
                        }}>
                        <Upload size={14} />
                        Import Excel
                      </Button>
                    </div>
                  </div>

                  {showAddProduct && (
                    <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg mb-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Nama Produk
                        </label>
                        <Input
                          placeholder="Ketik nama produk..."
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Harga per Supplier
                        </label>
                        <Input
                          type="number"
                          placeholder="Masukkan harga"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddProduct(false);
                            setNewProductName("");
                            setProductPrice("");
                          }}>
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          disabled={!newProductName.trim() || !productPrice}
                          onClick={handleAddProduct}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {showImportExcel && (
                    <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 w-fit"
                        onClick={handleDownloadTemplate}>
                        <Download size={14} />
                        Download Template
                      </Button>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowImportExcel(false);
                            setImportFile(null);
                          }}>
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleImportExcel}
                          disabled={importMutation.isLoading}>
                          {importMutation.isLoading ? "Importing..." : "Upload & Import"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {supplierProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Belum ada produk yang ditambahkan</p>
                      <p className="text-xs mt-1">
                        Klik "Tambah Produk" atau "Import Excel" untuk menambahkan
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Nama Produk</TableHead>
                            <TableHead className="text-xs text-right">Harga per Supplier</TableHead>
                            <TableHead className="text-xs text-center w-12">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supplierProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="text-sm font-medium">{product.name}</TableCell>
                              <TableCell className="text-sm text-right">
                                Rp {Number(product.price).toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveProduct(product.id)}>
                                  <Trash2 size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("page.supplier.form.status")}
              </h3>
              <div
                className={`pt-2 flex items-center justify-between p-4 rounded-lg ${
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
            </Card>

            <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-base mt-0.5">info</span>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  {t("page.supplier.form.tipsTitle")}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("page.supplier.form.tipsContent")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 bg-card border border-border rounded-xl p-4">
            <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
              <X size={18} />
              {t("common.cancel")}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDraftModal(true)}
                disabled={updateMutation.isLoading}
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
                disabled={updateMutation.isLoading}
                className="gap-2">
                <Save size={18} />
                {updateMutation.isLoading ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
        description={t("page.supplier.modal.updateSuccess")}
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

export default EditSupplier;
