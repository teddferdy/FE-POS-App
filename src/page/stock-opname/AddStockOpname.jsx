/* eslint-disable react/prop-types */
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import {
  Save,
  X,
  Plus,
  Info,
  MapPin,
  Download,
  Upload as UploadIcon,
  Building2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import {
  addStockOpname,
  updateStockOpname,
  changeStockOpnameStatus,
  downloadStockOpnameTemplate,
  getStockOpnameById
} from "@/services/stock";
import { getAllLocation } from "@/services/location";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Modal from "@/components/organism/modal";
import { Loading } from "@/components/ui/loading";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import UploadExcelModal from "./components/UploadExcelModal";

const toInt = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseInt(String(val).replace(/\D/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const sanitizeNumberInput = (value) => value.replace(/\D/g, "");

const calculateStockAkhir = (row) =>
  toInt(row.stokAwalJumlah) + toInt(row.barangMasukJumlah) - toInt(row.barangKeluarJumlah);

const calculateStockFisik = (row) => {
  if (
    row.stokFisikJumlah === null ||
    row.stokFisikJumlah === undefined ||
    row.stokFisikJumlah === ""
  )
    return null;
  return toInt(row.stokFisikJumlah);
};

const calculateSelisih = (row) => {
  const fisik = calculateStockFisik(row);
  if (fisik === null) return null;
  return fisik - calculateStockAkhir(row);
};

const getSelisihStyle = (value) => {
  if (value === null) return "text-muted-foreground";
  if (value < 0) return "text-red-600 font-semibold";
  if (value > 0) return "text-green-600 font-semibold";
  return "text-foreground";
};

const getAvailabilityStatus = (stock) => {
  if (stock <= 0)
    return {
      label: "Habis",
      className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
    };
  if (stock <= 10)
    return {
      label: "Menipis",
      className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
    };
  return {
    label: "Tersedia",
    className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
  };
};

let nextId = 1;

const createRow = (overrides = {}) => {
  const id = nextId++;
  return {
    id,
    kodeBarang: overrides.kodeBarang || "",
    namaBarang: overrides.namaBarang || "",
    satuan: overrides.satuan || "",
    lokasiId: overrides.lokasiId || "",
    lokasiLabel: overrides.lokasiLabel || "",
    store: overrides.store || "",
    stokAwalJumlah: overrides.stokAwalJumlah || "",
    barangMasukJumlah: overrides.barangMasukJumlah || "",
    barangKeluarJumlah: overrides.barangKeluarJumlah || "",
    stokFisikJumlah: overrides.stokFisikJumlah || "",
    keterangan: overrides.keterangan || ""
  };
};

const LokasiSelect = ({ value, locations, loading, onChange, onAddNew }) => {
  if (loading) return <Skeleton className="h-9 w-full" />;

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        if (val === "__add__") {
          onAddNew();
          return;
        }
        onChange(val);
      }}>
      <SelectTrigger className="h-9 border-0 border-b border-dashed border-muted-foreground/30 rounded-none focus:border-primary focus:border-solid shadow-none px-0 text-sm">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground/40 shrink-0" />
          <SelectValue placeholder="Pilih Lokasi" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {locations.map((loc) => (
          <SelectItem key={loc.id || loc._id} value={loc.id || loc._id}>
            {loc.name || loc.storeName}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value="__add__" className="text-primary font-medium">
          <div className="flex items-center gap-2">
            <Building2 size={14} />+ Tambah Lokasi Baru
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

const AddStockOpname = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [cancelModal, setCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [noLocationModal, setNoLocationModal] = useState(false);

  const [formMeta, setFormMeta] = useState({
    tanggalAudit: new Date(),
    auditor: ""
  });

  const [rows, setRows] = useState([createRow()]);
  const [catatan, setCatatan] = useState("");

  const { data: locationData, isLoading: locationLoading } = useQuery(
    ["locations-all"],
    getAllLocation
  );
  const locations = locationData?.data || locationData?.locations || locationData || [];

  // Fetch existing stock opname if editing
  const { data: stockOpnameData } = useQuery(["stock-opname", id], () => getStockOpnameById(id), {
    enabled: !!id
  });

  // Populate form when editing
  useEffect(() => {
    if (stockOpnameData && stockOpnameData.data) {
      const opname = stockOpnameData.data;
      setFormMeta({
        tanggalAudit: opname.auditDate ? new Date(opname.auditDate) : new Date(),
        auditor: opname.auditor || ""
      });
      setCatatan(opname.notes || "");
      // Map items to rows
      if (opname.items && opname.items.length > 0) {
        setRows(
          opname.items.map((item) => ({
            ...createRow(),
            kodeBarang: item.kodeBarang,
            namaBarang: item.namaBarang,
            satuan: item.satuan,
            lokasiId: item.lokasiId,
            lokasiLabel: item.lokasi,
            store: item.store,
            stokAwalJumlah: item.stokAwalJumlah,
            barangMasukJumlah: item.barangMasukJumlah,
            barangKeluarJumlah: item.barangKeluarJumlah,
            stokFisikJumlah: item.stokFisikJumlah,
            keterangan: item.keterangan
          }))
        );
      }
    }
  }, [stockOpnameData]);

  const updateRowField = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id !== id ? row : { ...row, [field]: value })));
  };

  const handleLokasiChange = (id, locationId) => {
    const loc = locations.find((l) => (l.id || l._id) === locationId);
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          lokasiId: locationId,
          lokasiLabel: loc?.name || loc?.storeName || locationId,
          store: loc?.store || loc?.id || ""
        };
      })
    );
  };

  const openAddLocation = () => {
    navigate("/add-location");
  };

  const addRow = () => setRows((prev) => [...prev, createRow()]);
  const removeRow = (id) => {
    if (rows.length > 1) setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDownloadTemplate = async () => {
    if (!locations || locations.length === 0) {
      setNoLocationModal(true);
      return;
    }
    setIsDownloading(true);
    try {
      await downloadStockOpnameTemplate();
      toast.success("Berhasil", { description: "Template berhasil di-download" });
    } catch (err) {
      toast.error("Gagal", {
        description: err?.response?.data?.message || err.message || "Gagal download template"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadParsed = (parsedRows) => {
    const filled = parsedRows.filter((r) => r.kodeBarang || r.namaBarang);
    if (filled.length === 0) {
      toast.warning("Import selesai", { description: "Tidak ada data barang yang ditemukan" });
      return;
    }
    const newRows = filled.map((r) => {
      const match = locations.find(
        (l) => (l.name || l.storeName || "").toLowerCase() === (r.lokasi || "").toLowerCase()
      );
      return createRow({
        kodeBarang: r.kodeBarang,
        namaBarang: r.namaBarang,
        satuan: r.satuan,
        lokasiId: match ? match.id || match._id : "",
        lokasiLabel: match ? match.name || match.storeName : r.lokasi,
        store: match?.store || match?.id || "",
        stokAwalJumlah: r.stokAwalJumlah,
        barangMasukJumlah: r.barangMasukJumlah,
        barangKeluarJumlah: r.barangKeluarJumlah,
        stokFisikJumlah: r.stokFisikJumlah,
        keterangan: r.keterangan
      });
    });
    setRows(newRows);
    toast.success("Berhasil", {
      description: `${newRows.length} data berhasil diimport dari Excel`
    });
  };

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const selisih = calculateSelisih(row);
        return { selisihJumlah: acc.selisihJumlah + (selisih === null ? 0 : selisih) };
      },
      { selisihJumlah: 0 }
    );
  }, [rows]);

  const buildPayload = () => ({
    auditDate:
      formMeta.tanggalAudit instanceof Date
        ? formMeta.tanggalAudit.toISOString().split("T")[0]
        : formMeta.tanggalAudit,
    auditor: formMeta.auditor,
    notes: catatan,
    items: rows.map((row) => {
      const stokAkhir = calculateStockAkhir(row);
      const fisik = calculateStockFisik(row);
      const selisih = calculateSelisih(row);

      return {
        kodeBarang: row.kodeBarang,
        namaBarang: row.namaBarang,
        satuan: row.satuan,
        lokasiId: row.lokasiId,
        lokasi: row.store || row.lokasiId,
        stokAwalJumlah: toInt(row.stokAwalJumlah),
        barangMasukJumlah: toInt(row.barangMasukJumlah),
        barangKeluarJumlah: toInt(row.barangKeluarJumlah),
        stokAkhirJumlah: stokAkhir,
        stokFisikJumlah: fisik,
        selisihJumlah: selisih,
        keterangan: row.keterangan
      };
    })
  });

  const validate = () => {
    if (!formMeta.tanggalAudit) {
      toast.error("Gagal", { description: "Tanggal audit wajib diisi" });
      return false;
    }
    if (!formMeta.auditor.trim()) {
      toast.error("Gagal", { description: "Nama auditor wajib diisi" });
      return false;
    }
    const invalidRow = rows.find(
      (row) =>
        !row.kodeBarang.trim() ||
        !row.namaBarang.trim() ||
        !row.satuan.trim() ||
        !row.lokasiId ||
        !row.stokAwalJumlah.toString().trim() ||
        !row.barangMasukJumlah.toString().trim() ||
        !row.barangKeluarJumlah.toString().trim() ||
        !row.stokFisikJumlah.toString().trim() ||
        !row.keterangan.trim()
    );
    if (invalidRow) {
      toast.error("Gagal", { description: "Semua data barang wajib diisi" });
      return false;
    }
    return true;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (id) {
        // Edit mode
        await updateStockOpname(id, payload);
        toast.success("Berhasil", { description: "Stock opname berhasil diupdate" });
      } else {
        // Create mode
        await addStockOpname(payload);
        toast.success("Berhasil", { description: "Stock opname disimpan sebagai Draft" });
      }
      queryClient.invalidateQueries(["stockOpname"]);
      navigate("/stock-opname");
    } catch (err) {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveComplete = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      let newId;
      if (id) {
        // Edit mode
        await updateStockOpname(id, payload);
        newId = id;
      } else {
        // Create mode
        const created = await addStockOpname(payload);
        newId = created?.data?.id || created?.id;
        if (!newId) throw new Error("Gagal mendapatkan ID opname");
      }
      // Then change status to completed
      await changeStockOpnameStatus(newId, "completed");
      toast.success("Berhasil", { description: "Stock opname berhasil diselesaikan" });
      queryClient.invalidateQueries(["stockOpname"]);
      navigate("/stock-opname");
    } catch (err) {
      toast.error("Gagal", { description: err?.response?.data?.message || err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? "Edit Stock Opname" : "Input Stock Opname"}
          </h1>
          <p className="text-sm text-muted-foreground">Audit persediaan produk di gudang</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="transition-all">
            <UploadIcon size={15} className="mr-1.5" />
            Upload Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onClick={handleDownloadTemplate}
            className="transition-all">
            {isDownloading ? (
              <Loader2 size={15} className="mr-1.5 animate-spin" />
            ) : (
              <Download size={15} className="mr-1.5" />
            )}
            {isDownloading ? "Download..." : "Download Template"}
          </Button>
        </div>
      </div>

      {/* Meta */}
      <Card className="p-6 shadow-sm border-muted">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tanggalAudit">
              Tanggal Audit <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              date={formMeta.tanggalAudit}
              setDate={(date) =>
                setFormMeta((prev) => ({ ...prev, tanggalAudit: date || new Date() }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auditor">
              Auditor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="auditor"
              placeholder="Nama Auditor"
              value={formMeta.auditor}
              onChange={(e) => setFormMeta((prev) => ({ ...prev, auditor: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Formula hint */}
      <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-xs text-blue-700 dark:text-blue-300 flex flex-wrap gap-x-6 gap-y-1 transition-colors">
        <span>
          <strong>Persediaan Akhir</strong> = Stok Awal + Barang Masuk − Barang Keluar
        </span>
        <span>
          <strong>Selisih Audit</strong> = Stock Fisik − Persediaan Akhir
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-sm border-muted">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b">
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Kode Barang
                </th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Nama Barang
                </th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap w-16">
                  Satuan
                </th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Lokasi
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Stok Awal
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Barang Masuk
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Barang Keluar
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Persd. Akhir
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Stock Fisik
                </th>
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Selisih
                </th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Ketersediaan
                </th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                  Keterangan
                </th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-3 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Info size={32} className="text-muted-foreground/40" />
                      <p className="text-sm">
                        Belum ada produk. Klik &rdquo;Tambah Produk&rdquo; untuk memulai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const stokAkhir = calculateStockAkhir(row);
                  const selisih = calculateSelisih(row);
                  const availability = getAvailabilityStatus(stokAkhir);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-muted/30 transition-colors hover:bg-muted/15">
                      <td className="border-r border-muted/20 px-3 py-2">
                        <input
                          type="text"
                          value={row.kodeBarang}
                          onChange={(e) => updateRowField(row.id, "kodeBarang", e.target.value)}
                          placeholder="Kode"
                          className="w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-sm outline-none focus:border-primary focus:border-solid transition-colors px-0 py-1"
                        />
                      </td>
                      <td className="border-r border-muted/20 px-3 py-2 min-w-[140px]">
                        <input
                          type="text"
                          value={row.namaBarang}
                          onChange={(e) => updateRowField(row.id, "namaBarang", e.target.value)}
                          placeholder="Nama barang"
                          className="w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-sm outline-none focus:border-primary focus:border-solid transition-colors px-0 py-1"
                        />
                      </td>
                      <td className="border-r border-muted/20 px-3 py-2">
                        <input
                          type="text"
                          value={row.satuan}
                          onChange={(e) => updateRowField(row.id, "satuan", e.target.value)}
                          placeholder="PCS"
                          className="w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-sm outline-none focus:border-primary focus:border-solid transition-colors px-0 py-1"
                        />
                      </td>
                      <td className="border-r border-muted/20 px-3 py-2 min-w-[150px]">
                        <LokasiSelect
                          value={row.lokasiId}
                          locations={locations}
                          loading={locationLoading}
                          onChange={(val) => handleLokasiChange(row.id, val)}
                          onAddNew={openAddLocation}
                        />
                      </td>
                      {[
                        "stokAwalJumlah",
                        "barangMasukJumlah",
                        "barangKeluarJumlah",
                        "stokFisikJumlah"
                      ].map((field) => (
                        <td key={field} className="border-r border-muted/20 px-3 py-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row[field]}
                            onChange={(e) =>
                              updateRowField(row.id, field, sanitizeNumberInput(e.target.value))
                            }
                            placeholder="0"
                            className="w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-sm text-right outline-none focus:border-primary focus:border-solid transition-colors px-0 py-1 tabular-nums"
                          />
                        </td>
                      ))}
                      <td className="border-r border-muted/20 px-3 py-2 text-right font-semibold tabular-nums">
                        {stokAkhir}
                      </td>
                      <td
                        className={`border-r border-muted/20 px-3 py-2 text-right font-semibold tabular-nums ${getSelisihStyle(selisih)}`}>
                        {selisih === null ? "-" : selisih > 0 ? `+${selisih}` : selisih}
                      </td>
                      <td className="border-r border-muted/20 px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${availability.className}`}>
                          {availability.label}
                        </span>
                      </td>
                      <td className="border-r border-muted/20 px-3 py-2">
                        <input
                          type="text"
                          value={row.keterangan}
                          onChange={(e) => updateRowField(row.id, "keterangan", e.target.value)}
                          placeholder="Catatan"
                          className="w-full bg-transparent border-0 border-b border-dashed border-muted-foreground/20 text-sm outline-none focus:border-primary focus:border-solid transition-colors px-0 py-1"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length <= 1}
                          className="text-muted-foreground/30 hover:text-destructive transition-colors disabled:opacity-20">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/10">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <Plus size={16} />
            Tambah Produk
          </button>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info size={12} />
              Total Selisih
            </div>
            <div
              className={`font-bold text-lg tabular-nums ${getSelisihStyle(totals.selisihJumlah)}`}>
              {totals.selisihJumlah > 0 ? `+${totals.selisihJumlah}` : totals.selisihJumlah}
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="catatan">
          Catatan Audit <span className="text-muted-foreground font-normal">(Opsional)</span>
        </Label>
        <Textarea
          id="catatan"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan tambahan tentang hasil stock opname..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => setCancelModal(true)} className="transition-all">
          <X size={16} className="mr-1" />
          Batal
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="transition-all min-w-[140px]">
          <Save size={16} className="mr-1" />
          {isSubmitting ? "Menyimpan..." : "Simpan sebagai Draft"}
        </Button>
        <Button
          onClick={handleSaveComplete}
          disabled={isSubmitting}
          className="transition-all min-w-[140px]">
          <Save size={16} className="mr-1" />
          {isSubmitting ? "Menyimpan..." : "Simpan & Selesai"}
        </Button>
      </div>

      {/* Loading */}
      {isSubmitting && <Loading fullscreen size="lg" label="Menyimpan..." />}

      {/* Cancel Modal */}
      <Modal
        type="confirm"
        open={cancelModal}
        onOpenChange={(open) => !open && setCancelModal(false)}
        title="Batalkan Input?"
        description="Data yang belum disimpan akan hilang."
        confirmText="Ya, Batalkan"
        onConfirm={() => {
          setCancelModal(false);
          navigate("/stock-opname");
        }}
      />

      {/* No Location Modal */}
      <Modal
        type="confirm"
        open={noLocationModal}
        onOpenChange={setNoLocationModal}
        title="Lokasi Belum Diisi"
        description="Belum ada data lokasi. Silakan tambah lokasi terlebih dahulu sebelum mendownload template stock opname."
        confirmText="Tambah Lokasi"
        onConfirm={() => navigate("/add-location")}
      />

      {/* Upload Excel Modal */}
      <UploadExcelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onDataParsed={handleUploadParsed}
        onUploadSuccess={() => navigate("/stock-opname")}
        auditDate={
          formMeta.tanggalAudit instanceof Date
            ? formMeta.tanggalAudit.toISOString().split("T")[0]
            : formMeta.tanggalAudit
        }
      />
    </div>
  );
};

export default AddStockOpname;
