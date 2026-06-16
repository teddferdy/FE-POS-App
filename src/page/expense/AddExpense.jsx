import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import { X, Save } from "lucide-react";
import { addExpense, getExpenseCategories } from "@/services/expense";
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
import Modal from "@/components/organism/modal";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

const AddExpense = () => {
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [draftModal, setDraftModal] = useState(false);

  const { data: categoriesData } = useQuery(["expense-categories"], getExpenseCategories);
  const categories = categoriesData?.data || categoriesData || [];

  const formSchema = z.object({
    categoryId: z.string().min(1, t("page.expense.add.validation.categoryRequired")),
    description: z.string().min(1, t("page.expense.add.validation.descriptionRequired")),
    amount: z.coerce.number().min(1, t("page.expense.add.validation.amountRequired")),
    date: z.date({ required_error: t("page.expense.add.validation.dateRequired") }),
    notes: z.string().optional().or(z.literal(""))
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      description: "",
      amount: "",
      date: new Date(),
      notes: ""
    }
  });

  const createMutation = useMutation(addExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      setSuccessModal(true);
    },
    onError: (err) => {
      toast.error(t("page.expense.add.toast.error"), {
        description:
          err?.response?.data?.message ||
          err.message ||
          t("page.expense.add.toast.errorDescription")
      });
    }
  });

  const onSubmit = (values, saveAsDraft = false) => {
    const { categoryId, ...rest } = values;
    const store = cookie?.user?.store || "";
    const payload = {
      ...rest,
      store,
      category: categoryId,
      date: values.date ? format(values.date, "yyyy-MM-dd") : "",
      status: saveAsDraft ? "draft" : "active"
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.home")}
        </button>
        <span className="text-xs">/</span>
        <button
          onClick={() => navigate("/expense")}
          className="hover:text-foreground transition-colors">
          {t("breadcrumb.management")}
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">{t("breadcrumb.add")}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("page.expense.add.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("page.expense.add.description")}</p>
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
                      {t("page.expense.add.category")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("page.expense.add.categoryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            {t("page.expense.add.noCategories")}
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
                      {t("page.expense.add.description")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input placeholder={t("page.expense.add.descriptionPlaceholder")} {...field} />
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
                      {t("page.expense.add.amount")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
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
                      {t("page.expense.add.date")} <span className="text-destructive">*</span>
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
                  <FormLabel>{t("page.expense.add.notes")}</FormLabel>
                  <Textarea
                    placeholder={t("page.expense.add.notesPlaceholder")}
                    rows={3}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-4 mt-6 bg-card border border-border rounded-xl p-4">
              <Button variant="outline" onClick={() => setCancelModal(true)} className="gap-2">
                <X size={18} />
                {t("common.cancel")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDraftModal(true)}
                  disabled={createMutation.isLoading}>
                  {t("page.expense.add.saveAsDraft")}
                </Button>
                <Button
                  onClick={() => form.handleSubmit((v) => onSubmit(v, false))()}
                  disabled={createMutation.isLoading}
                  className="gap-2">
                  <Save size={18} />
                  {createMutation.isLoading ? t("button.saving") : t("button.save")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>

      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={setCancelModal}
        title={t("page.expense.add.cancelTitle")}
        description={t("page.expense.add.cancelDescription")}
        confirmText={t("page.expense.add.cancelConfirm")}
        onConfirm={() => navigate("/expense")}
      />
      <Modal
        type="success"
        open={successModal}
        onOpenChange={setSuccessModal}
        title={t("page.expense.add.successTitle")}
        description={t("page.expense.add.successDescription")}
        confirmText={t("page.expense.add.successConfirm")}
        onConfirm={() => navigate("/expense")}
      />
      <Modal
        type="confirm"
        open={draftModal}
        onOpenChange={setDraftModal}
        title={t("page.expense.add.draftTitle")}
        description={t("page.expense.add.draftDescription")}
        confirmText={t("page.expense.add.draftConfirm")}
        onConfirm={() => {
          setDraftModal(false);
          const values = form.getValues();
          onSubmit(values, true);
        }}
      />
    </div>
  );
};

export default AddExpense;
