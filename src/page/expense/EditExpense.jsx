import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { X, Save } from "lucide-react";
import { getExpenseById, editExpense, getExpenseCategories } from "@/services/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Modal from "@/components/organism/modal";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const formSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah wajib diisi"),
  date: z.date({ required_error: "Tanggal wajib diisi" }),
  notes: z.string().optional().or(z.literal(""))
});

const EditExpense = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [cookie] = useCookies();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const user = cookie?.user;

  const { data: categoriesData } = useQuery(["expense-categories"], getExpenseCategories);
  const categories = categoriesData?.data || categoriesData || [];

  const { data: expenseData, isLoading } = useQuery(
    ["expense", id],
    () => getExpenseById(id),
    { enabled: !!id }
  );

  const expenseItem = expenseData?.data || {};

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      amount: "",
      date: undefined,
      notes: ""
    }
  });

  useEffect(() => {
    if (expenseItem?.id) {
      form.reset({
        categoryId:
          String(expenseItem.category ?? expenseItem.categoryData?.id ?? ""),
        description: expenseItem.description || "",
        amount: expenseItem.amount ?? "",
        date: expenseItem.date ? new Date(expenseItem.date) : undefined,
        notes: expenseItem.notes || ""
      });
    }
  }, [expenseItem, form]);

  const updateMutation = useMutation(editExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.expense.edit.fail"), {
        description: err?.response?.data?.message || err.message || t("page.expense.edit.failDesc")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { categoryId, ...rest } = values;
    const store = cookie?.user?.store || "";
    const payload = { id, ...rest, store, category: categoryId, date: values.date ? format(values.date, "yyyy-MM-dd") : "", status: saveAsDraft ? "draft" : "active" };
    updateMutation.mutate(payload);
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.expense.edit.idNotFound")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Loading fullscreen size="lg" label={t("page.expense.edit.loading")} />
    );
  }

  if (!expenseItem?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("page.expense.edit.notFound")}</p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("page.expense.edit.breadcrumbDashboard")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/expense")}
          className="hover:text-foreground transition-colors">
          {t("page.expense.edit.breadcrumbList")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("page.expense.edit.breadcrumb")}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("page.expense.edit.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("page.expense.edit.desc")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
            <X size={18} />
            {t("page.expense.edit.cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDraftModal(true)}
            disabled={updateMutation.isLoading}>
            {t("page.expense.edit.saveDraft")}
          </Button>
          <Button
            onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
            disabled={updateMutation.isLoading}
            className="gap-2">
            <Save size={18} />
            {updateMutation.isLoading ? t("page.expense.edit.saving") : t("page.expense.edit.save")}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.expense.edit.categoryLabel")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("page.expense.edit.categoryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            {t("page.expense.edit.noCategory")}
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id || cat._id} value={String(cat.id || cat._id)}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.expense.edit.descriptionLabel")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder={t("page.expense.edit.descriptionPlaceholder")} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.expense.edit.amountLabel")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={t("page.expense.edit.amountPlaceholder")}
                        className="pl-10"
                        value={field.value ? Number(field.value).toLocaleString("id-ID") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(raw ? Number(raw) : "");
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("page.expense.edit.dateLabel")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("page.expense.edit.notesLabel")}</FormLabel>
                  <Textarea placeholder={t("page.expense.edit.notesPlaceholder")} rows={3} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.expense.edit.modalCancelTitle")}
        description={t("page.expense.edit.modalCancelDesc")}
        confirmText={t("page.expense.edit.modalCancelConfirm")}
        onConfirm={() => navigate("/expense")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.expense.edit.modalSuccessTitle")}
        description={t("page.expense.edit.modalSuccessDesc")}
        confirmText={t("page.expense.edit.modalSuccessConfirm")}
        onConfirm={() => navigate("/expense")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.expense.edit.modalDraftTitle")}
        description={t("page.expense.edit.modalDraftDesc")}
        confirmText={t("page.expense.edit.modalDraftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
    </motion.div>
  );
};

export default EditExpense;
