/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Award, Medal, Diamond, Plus, CheckCircle, Delete, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const icons = [
  { name: "star", component: Star, fill: true },
  { name: "workspace_premium", component: Award, fill: false },
  { name: "military_tech", component: Medal, fill: false },
  { name: "diamond", component: Diamond, fill: false },
  { name: "plus", component: Plus, fill: false }
];

const colors = [
  { name: "amber", value: "#f59e0b", tailwind: "bg-amber-400" },
  { name: "slate", value: "#64748b", tailwind: "bg-slate-400" },
  { name: "indigo", value: "#6366f1", tailwind: "bg-indigo-500" },
  { name: "emerald", value: "#10b981", tailwind: "bg-emerald-500" },
  { name: "rose", value: "#f43f5e", tailwind: "bg-rose-500" }
];

const AddMemberTier = ({ onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    tierName: "",
    minPoints: "",
    discountPercent: "",
    isActive: true,
    selectedIcon: "star",
    selectedColor: "#f59e0b",
    perks: [
      { id: 1, text: "" },
      { id: 2, text: "" }
    ]
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerkChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.map((perk) => (perk.id === id ? { ...perk, text: value } : perk))
    }));
  };

  const addPerk = () => {
    const newId = Math.max(...formData.perks.map((p) => p.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      perks: [...prev.perks, { id: newId, text: "" }]
    }));
  };

  const removePerk = (id) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.filter((perk) => perk.id !== id)
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
  };

  const IconComponent = icons.find((i) => i.name === formData.selectedIcon)?.component || Star;

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {t("page.memberTier.add.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.memberTier.add.description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X size={18} />
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!formData.isActive} className="gap-2">
            <Save size={18} />
            {t("page.memberTier.add.saveTier")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Basic Information */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined">info</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.add.basicInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.add.tierName")}
                </label>
                <input
                  type="text"
                  value={formData.tierName}
                  onChange={(e) => handleInputChange("tierName", e.target.value)}
                  disabled={!formData.isActive}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50"
                  placeholder={t("page.memberTier.add.tierNamePlaceholder")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.add.minPoints")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.minPoints}
                    onChange={(e) =>
                      handleInputChange(
                        "minPoints",
                        e.target.value === "" ? "" : parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!formData.isActive}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50 pr-12"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    PTS
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.add.discountPercent")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      handleInputChange(
                        "discountPercent",
                        e.target.value === "" ? "" : parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!formData.isActive}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all bg-background text-sm disabled:opacity-50 pr-12"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Identity */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined">palette</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.add.visualIdentity")}
              </h3>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.add.selectIcon")}
                </label>
                <div className="flex gap-2">
                  {icons.map((icon) => {
                    const Icon = icon.component;
                    const isSelected = formData.selectedIcon === icon.name;
                    return (
                      <button
                        key={icon.name}
                        disabled={!formData.isActive}
                        onClick={() => handleInputChange("selectedIcon", icon.name)}
                        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 ${
                          isSelected
                            ? "bg-primary/10 border-2 border-primary text-primary"
                            : "bg-background border border-border text-muted-foreground hover:bg-accent"
                        }`}>
                        <Icon size={22} style={icon.fill ? { fill: "currentColor" } : {}} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("page.memberTier.add.badgeColor")}
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => {
                    const isSelected = formData.selectedColor === color.value;
                    return (
                      <button
                        key={color.name}
                        disabled={!formData.isActive}
                        onClick={() => handleInputChange("selectedColor", color.value)}
                        className={`w-8 h-8 rounded-full transition-all disabled:opacity-40 ${
                          color.tailwind
                        } ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "ring-1 ring-border"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits & Perks */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined">stars</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.add.benefits")}
              </h3>
            </div>
            <div className="space-y-3" id="perks-list">
              {formData.perks.map((perk) => (
                <div key={perk.id} className="flex items-center gap-2 group">
                  <div className="flex-1 relative">
                    <CheckCircle
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        perk.text.trim() ? "text-secondary" : "text-muted-foreground"
                      }`}
                    />
                    <input
                      type="text"
                      value={perk.text}
                      onChange={(e) => handlePerkChange(perk.id, e.target.value)}
                      disabled={!formData.isActive}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-all text-sm disabled:opacity-50"
                      placeholder={t("page.memberTier.add.perkPlaceholder")}
                    />
                  </div>
                  <button
                    onClick={() => removePerk(perk.id)}
                    disabled={!formData.isActive}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0">
                    <Delete size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addPerk}
                disabled={!formData.isActive}
                className="flex items-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all justify-center disabled:opacity-40 text-sm font-semibold">
                <Plus size={18} />
                {t("page.memberTier.add.addBenefit")}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Status Toggle */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <span className="material-symbols-outlined">toggle_on</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.add.tierStatus")}
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {formData.isActive ? t("common.active") : t("common.inactive")}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-2 mb-6 text-primary relative">
              <span className="material-symbols-outlined">visibility</span>
              <h3 className="text-base font-semibold text-foreground">
                {t("page.memberTier.add.previewBadge")}
              </h3>
            </div>
            <div className="bg-muted/30 rounded-xl p-5 border border-border relative flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                style={{
                  backgroundColor: formData.selectedColor,
                  boxShadow: `0 8px 16px ${formData.selectedColor}20`
                }}>
                <IconComponent
                  size={32}
                  className="text-white"
                  style={formData.selectedIcon === "star" ? { fill: "currentColor" } : {}}
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {t("page.memberTier.add.previewBadge")}
                </p>
                <h4 className="text-lg font-bold text-foreground">
                  {formData.tierName || "Gold Member"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Mulai dari{" "}
                  {(formData.minPoints === "" ? 0 : Number(formData.minPoints)).toLocaleString(
                    "id-ID"
                  )}{" "}
                  PTS
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-secondary mt-0.5 text-base">info</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("page.memberTier.add.footerHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberTier;
