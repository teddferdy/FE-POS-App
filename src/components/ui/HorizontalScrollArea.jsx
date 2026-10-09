import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHorizontalOverflow } from "@/hooks/useHorizontalOverflow";

// Scrollbars are hidden app-wide (index.css), so an overflowing table gave
// no hint that more columns exist. While (and only while) content overflows,
// this shows an edge fade on each side that still hides content, re-enables
// a thin scrollbar, and makes the viewport a labelled, focusable region so
// keyboard users can scroll it with the arrow keys.
const FADE_FROM = {
  card: { left: "from-card", right: "from-card" },
  background: { left: "from-background", right: "from-background" }
};

const HorizontalScrollArea = ({
  children,
  label,
  className,
  viewportClassName,
  fade = "card",
  viewportRef,
  contentKey,
  testIdPrefix
}) => {
  const { t } = useTranslation();
  const { ref, canScrollLeft, canScrollRight, overflowing } = useHorizontalOverflow(contentKey);
  const fadeFrom = FADE_FROM[fade] || FADE_FROM.card;
  const testId = (part) => (testIdPrefix ? `${testIdPrefix}-${part}` : undefined);

  const setViewport = useCallback(
    (node) => {
      ref.current = node;
      if (typeof viewportRef === "function") viewportRef(node);
      else if (viewportRef) viewportRef.current = node;
    },
    [ref, viewportRef]
  );

  return (
    <div className={cn("relative", className)}>
      {canScrollLeft && (
        <div
          data-testid={testId("fade-left")}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r to-transparent",
            fadeFrom.left
          )}
        />
      )}
      {canScrollRight && (
        <div
          data-testid={testId("fade-right")}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l to-transparent",
            fadeFrom.right
          )}
        />
      )}
      <div
        ref={setViewport}
        data-testid={testId("viewport")}
        role={overflowing ? "region" : undefined}
        aria-label={overflowing ? label || t("common.horizontalScrollRegion") : undefined}
        tabIndex={overflowing ? 0 : undefined}
        className={cn(
          "overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          overflowing && "scrollbar-visible",
          viewportClassName
        )}>
        {children}
      </div>
    </div>
  );
};

HorizontalScrollArea.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  viewportClassName: PropTypes.string,
  fade: PropTypes.oneOf(["card", "background"]),
  viewportRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  contentKey: PropTypes.any,
  testIdPrefix: PropTypes.string
};

export default HorizontalScrollArea;
