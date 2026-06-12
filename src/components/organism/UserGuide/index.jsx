import React, { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";

const guides = {
  "add-location": {
    titleKey: "guide.addLocation.title",
    steps: [
      { icon: "store", textKey: "guide.addLocation.step1" },
      { icon: "map", textKey: "guide.addLocation.step2" },
      { icon: "photo_camera", textKey: "guide.addLocation.step3" },
      { icon: "badge", textKey: "guide.addLocation.step4" },
      { icon: "toggle_on", textKey: "guide.addLocation.step5" },
      { icon: "checklist", textKey: "guide.addLocation.step6" }
    ]
  },
  "add-category": {
    titleKey: "guide.addCategory.title",
    steps: [
      { icon: "label", textKey: "guide.addCategory.step1" },
      { icon: "description", textKey: "guide.addCategory.step2" },
      { icon: "image", textKey: "guide.addCategory.step3" },
      { icon: "toggle_on", textKey: "guide.addCategory.step4" },
      { icon: "link", textKey: "guide.addCategory.step5" }
    ]
  },
  "add-supplier": {
    titleKey: "guide.addSupplier.title",
    steps: [
      { icon: "badge", textKey: "guide.addSupplier.step1" },
      { icon: "person", textKey: "guide.addSupplier.step2" },
      { icon: "call", textKey: "guide.addSupplier.step3" },
      { icon: "toggle_on", textKey: "guide.addSupplier.step4" }
    ]
  },
  "add-product": {
    titleKey: "guide.addProduct.title",
    steps: [
      { icon: "store", textKey: "guide.addProduct.step1" },
      { icon: "inventory_2", textKey: "guide.addProduct.step2" },
      { icon: "category", textKey: "guide.addProduct.step3" },
      { icon: "attach_money", textKey: "guide.addProduct.step4" },
      { icon: "layers", textKey: "guide.addProduct.step5" },
      { icon: "image", textKey: "guide.addProduct.step6" },
      { icon: "checklist", textKey: "guide.addProduct.step7" }
    ]
  },
  "add-member": {
    titleKey: "guide.addMember.title",
    steps: [
      { icon: "person_add", textKey: "guide.addMember.step1" },
      { icon: "call", textKey: "guide.addMember.step2" },
      { icon: "cake", textKey: "guide.addMember.step3" },
      { icon: "toggle_on", textKey: "guide.addMember.step4" }
    ]
  },
  "add-member-tier": {
    titleKey: "guide.addMemberTier.title",
    steps: [
      { icon: "stars", textKey: "guide.addMemberTier.step1" },
      { icon: "workspace_premium", textKey: "guide.addMemberTier.step2" },
      { icon: "percent", textKey: "guide.addMemberTier.step3" },
      { icon: "palette", textKey: "guide.addMemberTier.step4" },
      { icon: "checklist", textKey: "guide.addMemberTier.step5" },
      { icon: "toggle_on", textKey: "guide.addMemberTier.step6" },
      { icon: "link", textKey: "guide.addMemberTier.step7" }
    ]
  },
  "add-stock-opname": {
    titleKey: "guide.addStockOpname.title",
    steps: [
      { icon: "calendar_today", textKey: "guide.addStockOpname.step1" },
      { icon: "download", textKey: "guide.addStockOpname.step2" },
      { icon: "table_rows", textKey: "guide.addStockOpname.step3" },
      { icon: "inventory_2", textKey: "guide.addStockOpname.step4" },
      { icon: "calculate", textKey: "guide.addStockOpname.step5" },
      { icon: "edit_note", textKey: "guide.addStockOpname.step6" },
      { icon: "save", textKey: "guide.addStockOpname.step7" }
    ]
  },
  "add-department": {
    titleKey: "guide.addDepartment.title",
    steps: [
      { icon: "domain", textKey: "guide.addDepartment.step1" },
      { icon: "description", textKey: "guide.addDepartment.step2" },
      { icon: "toggle_on", textKey: "guide.addDepartment.step3" },
      { icon: "save", textKey: "guide.addDepartment.step4" }
    ]
  },
  "add-position": {
    titleKey: "guide.addPosition.title",
    steps: [
      { icon: "badge", textKey: "guide.addPosition.step1" },
      { icon: "domain", textKey: "guide.addPosition.step2" },
      { icon: "description", textKey: "guide.addPosition.step3" },
      { icon: "toggle_on", textKey: "guide.addPosition.step4" },
      { icon: "save", textKey: "guide.addPosition.step5" }
    ]
  },
  "add-employee": {
    titleKey: "guide.addEmployee.title",
    steps: [
      { icon: "person", textKey: "guide.addEmployee.step1" },
      { icon: "badge", textKey: "guide.addEmployee.step2" },
      { icon: "domain", textKey: "guide.addEmployee.step3" },
      { icon: "store", textKey: "guide.addEmployee.step4" },
      { icon: "payments", textKey: "guide.addEmployee.step5" },
      { icon: "image", textKey: "guide.addEmployee.step6" },
      { icon: "save", textKey: "guide.addEmployee.step7" }
    ]
  },
  "add-tax": {
    titleKey: "guide.addTax.title",
    steps: [
      { icon: "receipt_long", textKey: "guide.addTax.step1" },
      { icon: "category", textKey: "guide.addTax.step2" },
      { icon: "percent", textKey: "guide.addTax.step3" },
      { icon: "description", textKey: "guide.addTax.step4" },
      { icon: "toggle_on", textKey: "guide.addTax.step5" },
      { icon: "link", textKey: "guide.addTax.step6" }
    ]
  },
  "add-shift": {
    titleKey: "guide.addShift.title",
    steps: [
      { icon: "schedule", textKey: "guide.addShift.step1" },
      { icon: "timer", textKey: "guide.addShift.step2" },
      { icon: "description", textKey: "guide.addShift.step3" },
      { icon: "toggle_on", textKey: "guide.addShift.step4" },
      { icon: "link", textKey: "guide.addShift.step5" }
    ]
  },
  "add-type-payment": {
    titleKey: "guide.addTypePayment.title",
    steps: [
      { icon: "credit_card", textKey: "guide.addTypePayment.step1" },
      { icon: "category", textKey: "guide.addTypePayment.step2" },
      { icon: "description", textKey: "guide.addTypePayment.step3" },
      { icon: "toggle_on", textKey: "guide.addTypePayment.step4" },
      { icon: "link", textKey: "guide.addTypePayment.step5" }
    ]
  },
  "add-purchase-order": {
    titleKey: "guide.addPurchaseOrder.title",
    steps: [
      { icon: "person", textKey: "guide.addPurchaseOrder.step1" },
      { icon: "badge", textKey: "guide.addPurchaseOrder.step2" },
      { icon: "calendar_today", textKey: "guide.addPurchaseOrder.step3" },
      { icon: "inventory_2", textKey: "guide.addPurchaseOrder.step4" },
      { icon: "calculate", textKey: "guide.addPurchaseOrder.step5" },
      { icon: "description", textKey: "guide.addPurchaseOrder.step6" },
      { icon: "save", textKey: "guide.addPurchaseOrder.step7" }
    ]
  },
  "add-ingredient": {
    titleKey: "guide.addIngredient.title",
    steps: [
      { icon: "badge", textKey: "guide.addIngredient.step1" },
      { icon: "category", textKey: "guide.addIngredient.step2" },
      { icon: "swap_horiz", textKey: "guide.addIngredient.step3" },
      { icon: "inventory_2", textKey: "guide.addIngredient.step4" },
      { icon: "payments", textKey: "guide.addIngredient.step5" },
      { icon: "toggle_on", textKey: "guide.addIngredient.step6" },
      { icon: "save", textKey: "guide.addIngredient.step7" }
    ]
  }
};

const UserGuide = ({ guideKey }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const guide = guides[guideKey];

  if (!guide) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <BookOpen size={16} />
        {t("guide.button")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">{t(guide.titleKey)}</h2>
          </div>
          <div className="space-y-4">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">{step.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("guide.step", { number: i + 1 })}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{t(step.textKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserGuide;
