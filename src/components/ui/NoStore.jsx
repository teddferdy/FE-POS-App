import React from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NoStore = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-12">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Store size={32} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Toko Tidak Tersedia</p>
          <p className="text-sm text-muted-foreground mt-1">
            Silakan buat toko terlebih dahulu sebelum membuka halaman ini
          </p>
        </div>
        <Button onClick={() => navigate("/add-location")}>Tambah Toko</Button>
      </div>
    </Card>
  );
};

export default NoStore;
