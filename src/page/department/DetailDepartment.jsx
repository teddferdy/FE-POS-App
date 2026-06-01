import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getDepartmentById } from "@/services/department";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import PageHeader from "@/components/ui/PageHeader";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  } catch {
    return "-";
  }
};

const DetailDepartment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get("id");

  const { data: departmentData, isLoading } = useQuery(
    ["department-detail", departmentId],
    () => getDepartmentById({ id: departmentId }),
    { enabled: !!departmentId }
  );

  const dept = departmentData?.data || departmentData?.department || {};

  if (!departmentId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">domain</span>
        <p>ID departemen tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/department-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!dept || !dept.id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <span className="material-symbols-outlined text-4xl">domain</span>
        <p>Departemen tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("/department-list")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard-super-admin" },
          { label: "Kelola Departemen", href: "/department-list" },
          { label: dept.name }
        ]}
        title={dept.name}
        description="Informasi detail departemen dan sistem.">
        <Button
          onClick={() => navigate(`/edit-department?id=${dept.id}`)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-lg">edit</span>
          Edit Departemen
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">domain</span>
              <h3 className="text-base font-semibold text-foreground">Informasi Departemen</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nama Departemen
                </label>
                <p className="text-sm font-semibold text-foreground mt-1">{dept.name || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ID Departemen
                </label>
                <p className="text-sm font-semibold text-foreground mt-1 font-mono">
                  #{dept.id || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                      dept.status
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {dept.status ? "check_circle" : "cancel"}
                    </span>
                    {dept.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deskripsi
              </label>
              <p className="text-sm text-foreground mt-1">
                {dept.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-foreground">Informasi Sistem</h3>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dibuat Pada
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(dept.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{dept.createdBy || "System"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-base">update</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Diperbarui Pada
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(dept.updatedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">{dept.modifiedBy || "System"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDepartment;
