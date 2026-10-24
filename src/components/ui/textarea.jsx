import * as React from "react";

import { cn } from "@/lib/utils";
import { LengthCounter, atLimitClass, useLengthCount } from "@/components/ui/length-counter";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// A textarea with a maxLength shows a character counter (BA DR-28);
// `containerClassName` styles the wrapper that holds textarea + counter, and
// `unstyled` keeps a hand-styled textarea's own classes (no base classes);
// `showCount={false}` keeps a plain capped textarea.
const CountedTextarea = React.forwardRef(
  (
    { className, containerClassName, unstyled, maxLength, value, defaultValue, onChange, ...props },
    ref
  ) => {
    const counted = useLengthCount({ value, defaultValue, onChange, forwardedRef: ref });
    const counterId = React.useId();
    const atLimit = counted.length >= maxLength;
    return (
      <div className={cn("w-full", containerClassName)}>
        <textarea
          className={cn(!unstyled && textareaClass, className, atLimit && atLimitClass)}
          ref={counted.ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={counted.handleChange}
          {...props}
          aria-describedby={cn(props["aria-describedby"], counterId)}
        />
        <LengthCounter id={counterId} length={counted.length} maxLength={maxLength} />
      </div>
    );
  }
);
CountedTextarea.displayName = "CountedTextarea";

const Textarea = React.forwardRef(
  ({ className, containerClassName, unstyled, showCount = true, ...props }, ref) => {
    if (showCount && Number.isInteger(props.maxLength) && props.maxLength > 0) {
      return (
        <CountedTextarea
          ref={ref}
          className={className}
          containerClassName={containerClassName}
          unstyled={unstyled}
          {...props}
        />
      );
    }
    return <textarea className={cn(!unstyled && textareaClass, className)} ref={ref} {...props} />;
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
