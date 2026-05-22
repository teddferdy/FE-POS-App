/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Star,
  Award,
  Medal,
  Diamond,
  Plus,
  CheckCircle,
  X,
  Trash2,
  Save,
  Lightbulb
} from "lucide-react";

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

const EditMemberTier = ({ tier, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    tierName: tier.name || "",
    minPoints: tier.minPoints ? parseInt(tier.minPoints.replace(/[^\d]/g, "")) || 0 : 0,
    discountPercent: tier.discount ? parseInt(tier.discount) || 0 : 0,
    isActive: tier.status === "active",
    selectedIcon: "star",
    selectedColor: tier.color || "#f59e0b",
    perks: (tier.benefits || []).map((text, i) => ({ id: i + 1, text }))
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

  const handleDelete = () => {
    if (onDelete) onDelete(tier.id);
  };

  const IconComponent = icons.find((i) => i.name === formData.selectedIcon)?.component || Star;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
      {/* Header */}
      <div className="px-xl py-lg border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: formData.selectedColor,
              boxShadow: `0 8px 16px ${formData.selectedColor}20`
            }}>
            <IconComponent
              size={24}
              className="text-white"
              style={formData.selectedIcon === "star" ? { fill: "currentColor" } : {}}
            />
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Edit Member Tier</h2>
            <p className="font-body-md text-on-surface-variant">
              {formData.tierName || "Tier"} — Konfigurasi tingkatan member
            </p>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <span
            className={`font-label-md font-bold ${formData.isActive ? "text-[#006c49]" : "text-error"}`}>
            {formData.isActive ? "Active" : "Inactive"}
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
        </div>
      </div>

      <div className="p-xl space-y-xl">
        {/* General Information */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">Informasi Dasar</h3>
            <p className="font-body-md text-on-surface-variant">
              Konfigurasi poin minimal dan diskon untuk tier ini.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Tier Name</label>
                <input
                  type="text"
                  value={formData.tierName}
                  onChange={(e) => handleInputChange("tierName", e.target.value)}
                  disabled={!formData.isActive}
                  className="w-full border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary/20 outline-none border-primary/50 transition-all bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Contoh: Gold Member"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Minimum Points</label>
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
                <label className="font-label-md text-on-surface-variant">Potongan Harga (%)</label>
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

        {/* Visual Identity */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">Identitas Visual</h3>
            <p className="font-body-md text-on-surface-variant">
              Ikon dan warna badge untuk tier ini.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <div className="flex flex-wrap gap-xl">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Pilih Icon Badge</label>
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

              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Badge Color</label>
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
                  Preview Badge
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

        {/* Benefits */}
        <div className="grid grid-cols-12 gap-xl">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">Benefits & Perks</h3>
            <p className="font-body-md text-on-surface-variant">
              Daftar keuntungan yang didapatkan oleh member pada tingkatan ini.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-md">
            <div className="space-y-sm">
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
                      placeholder="Masukkan benefit..."
                    />
                  </div>
                  <button
                    onClick={() => removePerk(perk.id)}
                    disabled={!formData.isActive}
                    className="p-3 text-outline hover:text-error hover:bg-error/5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed">
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addPerk}
              disabled={!formData.isActive}
              className="flex items-center gap-sm px-lg py-2 rounded-lg border-2 border-dashed border-outline-variant text-outline hover:border-primary hover:text-primary transition-all active:scale-[0.98] w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant disabled:hover:text-outline">
              <Plus size={20} />
              <span className="font-label-md">Tambah Benefit Lainnya</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-xl py-lg bg-surface-container-low/50 border-t border-outline-variant/20 flex justify-between items-center">
        <button
          onClick={handleDelete}
          className="px-lg py-3 rounded-lg font-label-md border border-error text-error hover:bg-error/5 transition-all active:scale-95 flex items-center gap-sm">
          <Trash2 size={18} />
          Hapus Tier
        </button>
        <div className="flex items-center gap-md">
          <button
            onClick={onClose}
            className="px-lg py-3 rounded-lg font-label-md text-on-surface hover:bg-surface-container-high transition-all active:scale-95">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.isActive}
            className="px-xl py-3 bg-primary text-white rounded-lg font-label-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <Save size={20} />
            Update Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberTier;
