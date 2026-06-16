/* eslint-disable react/prop-types */
import * as React from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { ring: "h-6 w-6 border-2", dot: "h-1.5 w-1.5", text: "text-xs" },
  default: { ring: "h-9 w-9 border-[3px]", dot: "h-2 w-2", text: "text-sm" },
  lg: { ring: "h-12 w-12 border-[3px]", dot: "h-2.5 w-2.5", text: "text-base" },
  xl: { ring: "h-16 w-16 border-4", dot: "h-3 w-3", text: "text-lg" }
};

const SpinnerRing = ({ sizeClass }) => (
  <span className="relative inline-flex items-center justify-center">
    <span
      className={cn(
        "rounded-full border-border/40 border-t-primary border-r-primary/60 animate-spin",
        sizeClass.ring
      )}
      style={{ animation: "loading-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
    />
  </span>
);

const BouncingDots = ({ sizeClass }) => {
  const items = [0, 1, 2];
  return (
    <span className="inline-flex items-center gap-1.5">
      {items.map((i) => (
        <span
          key={i}
          className={cn("rounded-full bg-primary", sizeClass.dot)}
          style={{
            animation: "loading-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
    </span>
  );
};

const ProgressBar = ({ value, className }) => (
  <div className={cn("h-1 w-full max-w-[200px] rounded-full bg-muted overflow-hidden", className)}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const Loading = React.forwardRef(
  (
    {
      className,
      size = "default",
      label,
      fullscreen = false,
      variant = "ring",
      progress,
      ...props
    },
    ref
  ) => {
    const sizeClass = sizes[size] || sizes.default;

    const indicator =
      progress !== undefined ? (
        <ProgressBar value={progress} />
      ) : variant === "dots" ? (
        <BouncingDots sizeClass={sizeClass} />
      ) : (
        <SpinnerRing sizeClass={sizeClass} />
      );

    const content = (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-3",
          label || progress !== undefined ? "flex-col" : "",
          className
        )}
        {...props}>
        {indicator}
        {label && (
          <p
            className={cn(
              "font-medium text-muted-foreground/80 tracking-wide",
              sizeClass.text
            )}>
            {label}
          </p>
        )}
        {progress !== undefined && (
          <p className="text-xs font-semibold text-muted-foreground/60 tabular-nums">
            {Math.round(progress)}%
          </p>
        )}
      </div>
    );

    if (!fullscreen) return content;

    return (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-background/60 backdrop-blur-sm"
        style={{ animation: "loading-fade-in 0.2s ease-out" }}>
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-card/90 border border-border/50 shadow-2xl px-10 py-12">
          {indicator}
          {label && (
            <p className="text-sm font-semibold text-foreground/80 tracking-wide">{label}</p>
          )}
          {progress !== undefined && (
            <>
              <ProgressBar value={progress} className="max-w-[180px]" />
              <p className="text-xs font-semibold text-muted-foreground/60 tabular-nums">
                {Math.round(progress)}%
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
);
Loading.displayName = "Loading";

export { Loading };
