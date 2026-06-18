import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Search, Briefcase, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getAllPosition, deletePosition } from "@/services/position";
import UploadPositionModal from "./components/UploadPositionModal";

const PositionList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery(["positions"], () => getAllPosition());

  const positions = data?.data || data || [];

  const deleteMutation = useMutation(deletePosition, {
    onSuccess: () => {
      queryClient.invalidateQueries("positions");
      Toast.fire({ icon: "success", title: t("page.position.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.position.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.position.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredPositions = positions.filter((p) => {
    if (!search) return true;
    const name = (p.namePosition || p.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-primary" />
          <h1 className="text-xl font-bold">{t("page.position.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
            <Briefcase size={14} />
            {t("page.position.import")}
          </Button>
          <Button size="sm" onClick={() => navigate("/position/add")}>
            <Plus size={14} />
            {t("page.position.add")}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("page.position.search")}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredPositions.map((pos, idx) => {
          const id = pos?.id || pos?._id || pos?.ID || "";
          return (
            <div
              key={id || idx}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/position/${id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <Briefcase size={18} className="text-primary/60" />
                  </div>
                  <div>
                    <p className="font-medium">{pos.namePosition || pos.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {pos.descPosition || pos.description || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/position/edit/${id}`);
                    }}>
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(id);
                    }}>
                    <Trash2 size={14} />
                  </Button>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                </div>
              </div>
            </div>
          );
        })}
        {filteredPositions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Briefcase size={20} className="text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">{t("page.position.noPositions")}</p>
          </div>
        )}
      </div>

      {showUpload && <UploadPositionModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default PositionList;
