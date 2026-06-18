import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  addProductionOrder,
  editProductionOrder,
  getProductionOrderById
} from "@/services/production-order";
import { getAllProduct } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AddProductionOrder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [productId, setProductId] = useState("");
  const [plannedQty, setPlannedQty] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  // const [productSearch, setProductSearch] = useState("");

  const { data: productsData } = useQuery(["products-for-po"], () => getAllProduct({}), {
    staleTime: 60000
  });
  const products = productsData?.data || [];

  const { data: editData } = useQuery(["production-order", id], () => getProductionOrderById(id), {
    enabled: !!id
  });

  React.useEffect(() => {
    if (editData?.data) {
      const d = editData.data;
      setProductId(d.productItemId || "");
      setPlannedQty(String(d.plannedQty || ""));
      setScheduledDate(d.scheduledDate ? new Date(d.scheduledDate) : new Date());
      setNotes(d.notes || "");
    }
  }, [editData]);

  const selectedProduct = products.find((p) => p.id === parseInt(productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !plannedQty || parseInt(plannedQty) < 1) {
      toast.error(t("page.productionOrder.add.toastValidation"), {
        description: t("page.productionOrder.add.toastValidationDesc")
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        productItemId: parseInt(productId),
        plannedQty: parseInt(plannedQty),
        scheduledDate:
          scheduledDate instanceof Date ? scheduledDate.toISOString().split("T")[0] : scheduledDate,
        notes
      };
      if (id) {
        await editProductionOrder(id, payload);
      } else {
        await addProductionOrder(payload);
      }
      toast.success(t("page.productionOrder.add.toastSuccess"), {
        description: id
          ? t("page.productionOrder.add.toastSuccessDescEdit")
          : t("page.productionOrder.add.toastSuccessDescAdd")
      });
      queryClient.invalidateQueries(["production-orders"]);
      navigate("/production-order");
    } catch (err) {
      toast.error(t("page.productionOrder.add.toastError"), {
        description: err?.response?.data?.message || err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard-super-admin")}
            className="hover:text-foreground">
            {t("page.productionOrder.add.breadcrumbDashboard")}
          </button>
          <span className="text-xs">/</span>
          <button onClick={() => navigate("/production-order")} className="hover:text-foreground">
            {t("page.productionOrder.add.breadcrumbPO")}
          </button>
          <span className="text-xs">/</span>
          <span className="text-primary font-semibold">
            {id
              ? t("page.productionOrder.add.breadcrumbEdit")
              : t("page.productionOrder.add.breadcrumbAdd")}
          </span>
        </nav>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="show">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? t("page.productionOrder.add.titleEdit") : t("page.productionOrder.add.titleAdd")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {id
              ? t("page.productionOrder.add.subtitleEdit")
              : t("page.productionOrder.add.subtitleAdd")}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <form
          onSubmit={handleSubmit}
          className="bg-card p-6 rounded-xl border border-border space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label>
              {t("page.productionOrder.add.labelProduk")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">{t("page.productionOrder.add.placeholderPilihProduk")}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameProduct} ({p.sku || "-"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              {t("page.productionOrder.add.labelJumlahProduksi")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={plannedQty}
              onChange={(e) => setPlannedQty(e.target.value)}
              placeholder={t("page.productionOrder.add.placeholderJumlah")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("page.productionOrder.add.labelJadwal")}</Label>
            <DatePicker date={scheduledDate} setDate={setScheduledDate} />
          </div>

          <div className="space-y-2">
            <Label>{t("page.productionOrder.add.labelCatatan")}</Label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("page.productionOrder.add.placeholderCatatan")}
            />
          </div>

          {selectedProduct?.composition?.length > 0 && (
            <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                {t("page.productionOrder.add.bomComponents")}
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-blue-600 dark:text-blue-400">
                    <th className="pb-1">{t("page.productionOrder.add.bomBahan")}</th>
                    <th className="pb-1">{t("page.productionOrder.add.bomQtyPerUnit")}</th>
                    <th className="pb-1">{t("page.productionOrder.add.bomUnit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProduct.composition.map((c, i) => (
                    <tr key={i} className="text-blue-800 dark:text-blue-200">
                      <td>{c.ingredientName || c.name}</td>
                      <td>{c.qty}</td>
                      <td>{c.unit || "pcs"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setCancelModal(true)}>
              <X size={16} className="mr-1" /> {t("page.productionOrder.add.cancelButton")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save size={16} className="mr-1" />{" "}
              {isSubmitting
                ? t("page.productionOrder.add.savingButton")
                : t("page.productionOrder.add.saveButton")}
            </Button>
          </div>
        </form>
      </motion.div>

      {isSubmitting && (
        <Loading fullscreen size="lg" label={t("page.productionOrder.add.loadingLabel")} />
      )}

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(o) => !o && setCancelModal(false)}
        title={t("page.productionOrder.add.cancelModalTitle")}
        description={t("page.productionOrder.add.cancelModalDesc")}
        confirmText={t("page.productionOrder.add.cancelModalConfirm")}
        onConfirm={() => {
          setCancelModal(false);
          navigate("/production-order");
        }}
      />
    </div>
  );
};

export default AddProductionOrder;
