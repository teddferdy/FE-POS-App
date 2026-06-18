import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Search, Users, ChevronRight, Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteAlert } from "@/components/organism/alert";
import { Toast } from "@/components/organism/toast";
import { getAllEmployee, deleteEmployee } from "@/services/employee";

const EmployeeList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery(["employees"], () => getAllEmployee());

  const employees = data?.data || data || [];

  const deleteMutation = useMutation(deleteEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries("employees");
      Toast.fire({ icon: "success", title: t("page.employee.deleted") });
    },
    onError: () => {
      Toast.fire({ icon: "error", title: t("page.employee.deleteError") });
    }
  });

  const handleDelete = (id) => {
    DeleteAlert.fire({
      title: t("page.employee.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel")
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredEmployees = employees.filter((e) => {
    if (!search) return true;
    const name = (e.nameEmployee || e.name || "").toLowerCase();
    const email = (e.email || "").toLowerCase();
    const phone = (e.phone || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
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
          <Users size={20} className="text-primary" />
          <h1 className="text-xl font-bold">{t("page.employee.title")}</h1>
        </div>
        <Button size="sm" onClick={() => navigate("/employee/add")}>
          <Plus size={14} />
          {t("page.employee.add")}
        </Button>
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
          placeholder={t("page.employee.search")}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredEmployees.map((emp, idx) => {
          const id = emp?.id || emp?._id || emp?.ID || "";
          const avatarUrl = emp.imageEmployee || emp.image || emp.photo || null;
          return (
            <div
              key={id || idx}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/employee/${id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={avatarUrl || "/placeholder.svg"}
                        alt={emp.nameEmployee || emp.name || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                      <Users size={18} className="text-primary/60" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{emp.nameEmployee || emp.name || "-"}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {emp.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail size={10} />
                          {emp.email}
                        </span>
                      )}
                      {emp.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone size={10} />
                          {emp.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employee/edit/${id}`);
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
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">{t("page.employee.noEmployees")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
