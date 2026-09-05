import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { getPositionByDepartment } from "@/services/position";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CheckCircle2 } from "lucide-react";

const DepartmentPositions = ({ departmentId, currentPositionId }) => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery(
    ["positions-by-department", departmentId],
    () => getPositionByDepartment(departmentId),
    { enabled: !!departmentId }
  );

  const positions = data?.data || [];

  if (!departmentId) return null;

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
        <Skeleton className="h-4 w-48 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("page.position.departmentPositions.title")}
        </h4>
        {positions.length > 0 && (
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">
            {t("page.position.departmentPositions.count", { count: positions.length })}
          </span>
        )}
      </div>
      {positions.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Briefcase size={16} />
          <span>{t("page.position.departmentPositions.empty")}</span>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {positions.map((pos) => {
            const isCurrent = String(pos.id) === String(currentPositionId);
            return (
              <li
                key={pos.id}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                    : "bg-background text-foreground border border-border"
                }`}>
                <CheckCircle2
                  size={14}
                  className={isCurrent ? "text-primary" : "text-muted-foreground"}
                />
                <span>{pos.name}</span>
                {isCurrent && (
                  <span className="text-xs text-primary ml-auto">
                    {t("page.position.departmentPositions.currentPosition")}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DepartmentPositions;
