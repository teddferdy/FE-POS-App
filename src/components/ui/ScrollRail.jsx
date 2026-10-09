import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalOverflow } from "@/hooks/useHorizontalOverflow";

const RailButton = ({ direction, label, disabled, onClick }) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35">
    {direction === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
  </button>
);

const ScrollRail = ({
  children,
  leftLabel,
  rightLabel,
  railTestId,
  fadeTestIdPrefix,
  gutterClassName = "flex items-center gap-2 px-4 lg:px-6",
  railClassName = ""
}) => {
  const { ref: railRef, canScrollLeft, canScrollRight } = useHorizontalOverflow(children);

  const scrollRail = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const fadeId = (side) => (fadeTestIdPrefix ? `${fadeTestIdPrefix}-fade-${side}` : undefined);

  return (
    <div className={gutterClassName}>
      <RailButton
        direction="left"
        label={leftLabel}
        disabled={!canScrollLeft}
        onClick={() => scrollRail(-1)}
      />
      <div className="relative min-w-0 flex-1">
        {canScrollLeft && (
          <div
            data-testid={fadeId("left")}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
          />
        )}
        {canScrollRight && (
          <div
            data-testid={fadeId("right")}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
          />
        )}
        <div
          ref={railRef}
          data-testid={railTestId}
          className={`overflow-x-auto scrollbar-none ${railClassName}`}>
          {children}
        </div>
      </div>
      <RailButton
        direction="right"
        label={rightLabel}
        disabled={!canScrollRight}
        onClick={() => scrollRail(1)}
      />
    </div>
  );
};

ScrollRail.propTypes = {
  children: PropTypes.node.isRequired,
  leftLabel: PropTypes.string.isRequired,
  rightLabel: PropTypes.string.isRequired,
  railTestId: PropTypes.string,
  fadeTestIdPrefix: PropTypes.string,
  gutterClassName: PropTypes.string,
  railClassName: PropTypes.string
};

export default ScrollRail;
