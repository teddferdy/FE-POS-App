import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
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
import { getEmployeeById } from "@/services/employee";

const DetailEmployee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery(["employee", id], () => getEmployeeById(id), {
    enabled: !!id
  });

  const employee = data?.data || data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t("page.employee.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/employee")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const avatarUrl = employee.imageEmployee || employee.image || employee.photo || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/employee")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{employee.nameEmployee || employee.name || "-"}</h1>
            <p className="text-sm text-muted-foreground">{t("page.employee.detailDesc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => navigate(`/employee/edit/${id}`)}>
            <Edit3 size={14} />
            {t("common.edit")}
          </Button>
        </div>

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
                  {employee.department?.nameDepartment ||
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
                  {employee.position?.namePosition ||
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailEmployee;
