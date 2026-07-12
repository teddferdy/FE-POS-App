import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Edit3,
  Calendar,
  Phone,
  Mail,
  Building2,
  Briefcase,
  MapPin
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeById } from "@/services/employee";

const DetailEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["employee", id], () => getEmployeeById(id), {
    enabled: !!id
  });

  const employee = data?.data || data;

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.employee.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/employee-list")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
            {t("breadcrumb.dashboard")}
          </button>
          <span className="text-xs">/</span>
          <button
            onClick={() => navigate("/employee-list")}
            className="hover:text-foreground transition-colors">
            {t("breadcrumb.employee")}
          </button>
          <span className="text-xs">/</span>
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="text-primary font-semibold">{employee?.nameEmployee || employee?.name || "Detail"}</span>
          )}
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/employee-list")}>
              <ArrowLeft size={16} />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck size={24} />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{employee?.nameEmployee || employee?.name || "-"}</h1>
                  <p className="text-sm text-muted-foreground">{t("page.employee.detailDesc")}</p>
                </>
              )}
            </div>
          </div>
          {!isLoading && (
            <Button
              variant="outline"
              onClick={() => navigate(`/edit-employee?id=${id}`)}>
              <Edit3 size={14} className="mr-1.5" />
              {t("common.edit")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <Card className="p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </Card>
        ) : !employee ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("page.employee.notFound")}</p>
          </div>
        ) : (() => {
          const avatarUrl = employee.imageEmployee || employee.image || employee.photo || null;

          return (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              {avatarUrl && (
                <div className="w-full h-48 overflow-hidden bg-muted/30">
                  <img
                    src={avatarUrl || "/placeholder.svg"}
                    alt={employee.nameEmployee || employee.name || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users size={16} />
                  {t("page.employee.info")}
                </div>
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("page.employee.name")}</p>
                    <p className="font-medium">{employee.nameEmployee || employee.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail size={12} />
                      {t("page.employee.email")}
                    </p>
                    <p className="font-medium">{employee.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone size={12} />
                      {t("page.employee.phone")}
                    </p>
                    <p className="font-medium">{employee.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 size={12} />
                      {t("page.employee.department")}
                    </p>
                    <p className="font-medium">
                      {employee.departmentData?.name ||
                        employee.department?.nameDepartment ||
                        employee.department?.name ||
                        employee.departmentName ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase size={12} />
                      {t("page.employee.position")}
                    </p>
                    <p className="font-medium">
                      {employee.positionData?.name ||
                        employee.position?.namePosition ||
                        employee.position?.name ||
                        employee.positionName ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} />
                      {t("page.employee.address")}
                    </p>
                    <p className="font-medium">{employee.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {t("common.createdAt")}
                    </p>
                    <p className="font-medium">
                      {employee.createdAt
                        ? new Date(employee.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("common.createdBy")}:{" "}
                      {employee.createdByUser?.fullName ||
                        employee.createdByUser?.userName ||
                        employee.createdBy ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("common.modifiedBy")}:{" "}
                      {employee.modifiedByUser?.fullName ||
                        employee.modifiedByUser?.userName ||
                        employee.modifiedBy ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DetailEmployee;
