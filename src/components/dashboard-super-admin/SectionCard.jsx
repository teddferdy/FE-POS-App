import React from "react";

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = ""
}) => {
  return (
    <div
      className={`bg-card rounded-xl border border-border overflow-hidden shadow-sm ${className}`}>
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default SectionCard;
