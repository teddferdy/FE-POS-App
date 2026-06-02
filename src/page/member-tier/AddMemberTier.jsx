/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Star, Award, Medal, Diamond, Plus, CheckCircle, Delete, Save } from "lucide-react";

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
      { id: 1, text: "Diskon 10% Semua Item" },
      { id: 2, text: "Akses Eksklusif Produk Baru" }
    ]
  });

  const [showToast, setShowToast] = useState(false);

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
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      if (onSave) onSave(formData);
    }, 1500);
  };

  const IconComponent = icons.find((i) => i.name === formData.selectedIcon)?.component || Star;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
      {/* Header */}
      <div className="px-xl py-lg border-b border-outline-variant/20 flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {t("page.memberTier.add.title")}
          </h2>
          <p className="font-body-md text-on-surface-variant">
            {t("page.memberTier.add.description")}
          </p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-md text-on-surface-variant">
            {t("page.memberTier.add.tierStatus")}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 rounded-full peer-focus:outline-none peer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                formData.isActive ? "bg-[#006c49]" : "bg-error"
              } peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white`}
            />
          </label>
          <span
            className={`font-label-md font-bold ${formData.isActive ? "text-[#006c49]" : "text-error"}`}>
            {formData.isActive ? t("common.active") : t("common.inactive")}
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-xl space-y-xl">
        {/* General Information Section */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">
              {t("page.memberTier.add.basicInfo")}
            </h3>
            <p className="font-body-md text-on-surface-variant">
              {t("page.memberTier.add.basicInfoDesc")}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">
                  {t("page.memberTier.add.tierName")}
                </label>
                <input
                  type="text"
                  value={formData.tierName}
                  onChange={(e) => handleInputChange("tierName", e.target.value)}
                  disabled={!formData.isActive}
                  className="w-full border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary/20 outline-none border-primary/50 transition-all bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("page.memberTier.add.tierNamePlaceholder")}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">
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
                    className="w-full border border-outline-variant rounded-lg p-3 pr-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-outline">
                    PTS
                  </span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">
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
                    className="w-full border border-outline-variant rounded-lg p-3 pr-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-outline">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Visual Identity Section */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">
              {t("page.memberTier.add.visualIdentity")}
            </h3>
            <p className="font-body-md text-on-surface-variant">
              {t("page.memberTier.add.visualIdentityDesc")}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <div className="flex flex-wrap gap-xl">
              {/* Badge Icon Picker */}
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">
                  {t("page.memberTier.add.selectIcon")}
                </label>
                <div className="flex gap-sm">
                  {icons.map((icon) => {
                    const Icon = icon.component;
                    const isSelected = formData.selectedIcon === icon.name;
                    return (
                      <button
                        key={icon.name}
                        disabled={!formData.isActive}
                        onClick={() => handleInputChange("selectedIcon", icon.name)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-surface-container-low border-2 border-primary text-primary"
                            : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                        }`}>
                        <Icon size={24} style={icon.fill ? { fill: "currentColor" } : {}} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badge Color Picker */}
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">
                  {t("page.memberTier.add.badgeColor")}
                </label>
                <div className="flex gap-sm">
                  {colors.map((color) => {
                    const isSelected = formData.selectedColor === color.value;
                    return (
                      <button
                        key={color.name}
                        disabled={!formData.isActive}
                        onClick={() => handleInputChange("selectedColor", color.value)}
                        className={`w-8 h-8 rounded-full border-4 border-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          color.tailwind
                        } ${isSelected ? "ring-2 ring-primary scale-110" : "ring-1 ring-outline-variant"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant/30 flex items-center gap-lg max-w-sm">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
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
                <p className="font-label-md text-on-surface-variant uppercase tracking-widest">
                  {t("page.memberTier.add.previewBadge")}
                </p>
                <h4 className="font-headline-md text-on-surface">
                  {formData.tierName || "Gold Member"}
                </h4>
                <p className="font-body-md text-on-surface-variant">
                  Mulai dari{" "}
                  {(formData.minPoints === "" ? 0 : Number(formData.minPoints)).toLocaleString(
                    "id-ID"
                  )}{" "}
                  PTS
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Benefits & Perks Section */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">
              {t("page.memberTier.add.benefits")}
            </h3>
            <p className="font-body-md text-on-surface-variant">
              {t("page.memberTier.add.benefitsDesc")}
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-md">
            <div className="space-y-sm" id="perks-list">
              {formData.perks.map((perk) => (
                <div key={perk.id} className="flex items-center gap-sm group">
                  <div className="flex-1 relative">
                    <CheckCircle
                      size={18}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        perk.text.trim() ? "text-[#006c49]" : "text-outline"
                      }`}
                    />
                    <input
                      type="text"
                      value={perk.text}
                      onChange={(e) => handlePerkChange(perk.id, e.target.value)}
                      disabled={!formData.isActive}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={t("page.memberTier.add.perkPlaceholder")}
                    />
                  </div>
                  <button
                    onClick={() => removePerk(perk.id)}
                    disabled={!formData.isActive}
                    className="p-3 text-outline hover:text-error hover:bg-error/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed">
                    <Delete size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addPerk}
              disabled={!formData.isActive}
              className="flex items-center gap-sm px-lg py-2 rounded-lg border-2 border-dashed border-outline-variant text-outline hover:border-primary hover:text-primary transition-all active:scale-[0.98] w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant disabled:hover:text-outline">
              <Plus size={20} />
              <span className="font-label-md">{t("page.memberTier.add.addBenefit")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-xl py-lg bg-surface-container-low/50 border-t border-outline-variant/20 flex justify-between items-center">
        <div className="flex items-center gap-sm text-outline">
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <p className="font-label-md">{t("page.memberTier.add.footerHint")}</p>
        </div>
        <div className="flex items-center gap-md">
          <button
            onClick={onClose}
            className="px-lg py-3 rounded-lg font-label-md text-on-surface hover:bg-surface-container-high transition-all active:scale-95">
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.isActive}
            className="px-xl py-3 bg-primary text-white rounded-lg font-label-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary">
            <Save size={20} />
            {t("page.memberTier.add.saveTier")}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      <div
        className={`fixed bottom-xl right-xl z-[100] transform transition-all duration-500 ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}>
        <div className="bg-secondary-container text-on-secondary-container px-lg py-md rounded-xl shadow-xl flex items-center gap-md">
          <div className="bg-[#006c49] text-white p-1 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-title-lg text-title-lg">{t("page.memberTier.add.toastSuccess")}</p>
            <p className="font-body-md opacity-80">{t("page.memberTier.add.toastDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberTier;
