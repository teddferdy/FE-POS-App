import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { DollarSign, X } from "lucide-react";
import { openCashRegister } from "@/services/cash-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CashRegisterOpenClose = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cookie] = useCookies();
  const user = cookie?.user;

  const [openingBalance, setOpeningBalance] = useState("0");
  const [notes, setNotes] = useState("");

  const openMut = useMutation(
    () =>
      openCashRegister({
        storeId: parseInt(user?.store),
        openedBy: user?.id,
        openingBalance: parseFloat(openingBalance) || 0,
        notes
      }),
    {
      onSuccess: () => {
        toast.success("Berhasil", { description: "Kasir dibuka" });
        queryClient.invalidateQueries(["cash-register"]);
        navigate("/cash-register/current");
      },
      onError: (err) =>
        toast.error("Gagal", { description: err?.response?.data?.message || err.message })
    }
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
        <span className="text-primary font-semibold">Buka Kasir</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Buka Kasir</h1>
        <p className="text-sm text-muted-foreground mt-1">Mulai shift kasir</p>
      </div>

      <div className="max-w-lg bg-card p-6 rounded-xl border border-border space-y-4">
        <div className="space-y-2">
          <Label>
            Saldo Awal <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              Rp
            </span>
            <Input
              type="number"
              min="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Catatan</Label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Catatan (opsional)"
          />
        </div>
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={() => navigate("/dashboard-super-admin")}>
            <X size={16} className="mr-1" /> Batal
          </Button>
          <Button onClick={() => openMut.mutate()} disabled={openMut.isLoading}>
            <DollarSign size={16} className="mr-1" />{" "}
            {openMut.isLoading ? "Membuka..." : "Buka Kasir"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterOpenClose;
