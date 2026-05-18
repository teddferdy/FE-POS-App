/* eslint-disable react/prop-types */
import * as React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

const Loading = React.forwardRef(
  ({ className, size = "default", label, fullscreen = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16"
    };

    const spinner = (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-3",
          fullscreen && "fixed inset-0 z-50 flex-col bg-background/80 backdrop-blur-sm",
          className
        )}
        {...props}>
        <Loader className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
      </div>
    );

    return spinner;
  }
);
Loading.displayName = "Loading";

export { Loading };
