import React from "react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ icon: Icon = SearchX, title, description, children, className }) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-muted/60 text-muted-foreground shadow-sm mb-6">
        <Icon className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>
      )}
    </div>
  );
};

export default EmptyState;
