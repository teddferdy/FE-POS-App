/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({ breadcrumbs = [], title, description, children }) => {
  const navigate = useNavigate();

  return (
    <header className="space-y-4">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.label + i}>
              {i > 0 && <span className="text-xs">/</span>}
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href)}
                  className="hover:text-foreground transition-colors whitespace-nowrap">
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "text-primary font-semibold whitespace-nowrap"
                      : "whitespace-nowrap"
                  }>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {children && (
          <div
            className="overflow-x-auto shrink-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="flex items-center gap-2 flex-nowrap">{children}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
