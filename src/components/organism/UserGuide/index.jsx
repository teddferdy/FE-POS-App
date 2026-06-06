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
      { icon: "toggle_on", textKey: "guide.addLocation.step4" },
      { icon: "checklist", textKey: "guide.addLocation.step5" }
    ]
  },
  "add-category": {
    titleKey: "guide.addCategory.title",
    steps: [
      { icon: "label", textKey: "guide.addCategory.step1" },
      { icon: "description", textKey: "guide.addCategory.step2" },
      { icon: "image", textKey: "guide.addCategory.step3" },
      { icon: "toggle_on", textKey: "guide.addCategory.step4" }
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
      { icon: "inventory_2", textKey: "guide.addProduct.step1" },
      { icon: "category", textKey: "guide.addProduct.step2" },
      { icon: "attach_money", textKey: "guide.addProduct.step3" },
      { icon: "image", textKey: "guide.addProduct.step4" }
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
      { icon: "social_score", textKey: "guide.addMemberTier.step2" },
      { icon: "percent", textKey: "guide.addMemberTier.step3" },
      { icon: "palette", textKey: "guide.addMemberTier.step4" }
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
        <DialogContent className="sm:max-w-lg">
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
                  <p className="text-sm text-foreground">{t(step.textKey)}</p>
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
