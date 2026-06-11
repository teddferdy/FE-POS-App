import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getBomById } from "@/services/bom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DetailBom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useQuery(["bom-detail", id], () => getBomById(id), { enabled: !!id });
  const bom = data?.data;

  if (isLoading)
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!bom)
    return (
      <div className="p-6">
        <p className="text-muted-foreground">BOM tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/bom")} className="mt-4">
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate("/dashboard-super-admin")}
          className="hover:text-foreground">
          Dashboard
        </button>
        <span className="text-xs">/</span>
        <button onClick={() => navigate("/bom")} className="hover:text-foreground">
          BOM
        </button>
        <span className="text-xs">/</span>
        <span className="text-primary font-semibold">Detail</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail BOM</h1>
          <p className="text-sm text-muted-foreground mt-1">{bom.name || `BOM #${bom.id}`}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/bom")}>
          <ArrowLeft size={16} className="mr-1" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Informasi BOM</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Nama", bom.name || `BOM #${bom.id}`],
                  ["Produk", bom.productData?.nameProduct || "-"],
                  ["SKU", bom.productData?.sku || "-"],
                  ["Total Item Bahan", `${bom.lines?.length || 0} item`],
                  ["Catatan", bom.notes || "-"],
                  ["Tanggal", new Date(bom.createdAt).toLocaleDateString("id")]
                ].map(([l, v]) => (
                  <tr key={l} className="border-b border-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground w-40">{l}</td>
                    <td className="py-2 font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Daftar Bahan Baku</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Bahan</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-center">Unit</th>
                  <th className="pb-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {bom.lines?.length > 0 ? (
                  bom.lines.map((line, i) => (
                    <tr key={i} className="border-b border-muted/20">
                      <td className="py-2">{line.ingredientData?.nameProduct || "-"}</td>
                      <td className="py-2 text-right font-mono">{line.qty}</td>
                      <td className="py-2 text-center">{line.unit || "pcs"}</td>
                      <td className="py-2">{line.notes || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      Tidak ada bahan baku
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Ringkasan
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              <ClipboardList size={14} /> {bom.lines?.length || 0} Bahan Baku
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBom;
