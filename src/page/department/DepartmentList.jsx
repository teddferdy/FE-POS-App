import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Search, Building2, ChevronRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getAllDepartment, deleteDepartment } from "@/services/department";
import UploadDepartmentModal from "./components/UploadDepartmentModal";

const DepartmentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery(["departments"], () => getAllDepartment());

  const departments = data?.data || data || [];

  const deleteMutation = useMutation(deleteDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries("departments");
      Toast.fire({ icon: "success", title: t("page.department.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.department.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.department.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredDepartments = departments.filter((d) => {
    if (!search) return true;
    const name = (d.nameDepartment || d.name || "").toLowerCase();
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
          <Building2 size={20} className="text-primary" />
          <h1 className="text-xl font-bold">{t("page.department.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
            <Users size={14} />
            {t("page.department.import")}
          </Button>
          <Button size="sm" onClick={() => navigate("/department/add")}>
            <Plus size={14} />
            {t("page.department.add")}
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
          placeholder={t("page.department.search")}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredDepartments.map((dept, idx) => {
          const id = dept?.id || dept?._id || dept?.ID || "";
          return (
            <div
              key={id || idx}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/department/${id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <Building2 size={18} className="text-primary/60" />
                  </div>
                  <div>
                    <p className="font-medium">{dept.nameDepartment || dept.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.nameDepartmentEnglish || dept.nameEnglish || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/department/edit/${id}`);
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
        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Building2 size={20} className="text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">
              {t("page.department.noDepartments")}
            </p>
          </div>
        )}
      </div>

      {showUpload && <UploadDepartmentModal onClose={() => setShowUpload(false)} />}
    </div>
  );
};

export default DepartmentList;
