import { useCallback, useEffect, useRef, useState } from "react";

// Tracks whether a horizontally scrollable element hides content on either
// side. Shared by ScrollRail (card rails) and HorizontalScrollArea (tables)
// so overflow detection lives in one place. `contentKey` re-measures when
// the content changes; ResizeObserver covers layout changes where available.
export const useHorizontalOverflow = (contentKey) => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ canScrollLeft: false, canScrollRight: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 1;
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.canScrollLeft === canScrollLeft && prev.canScrollRight === canScrollRight
        ? prev
        : { canScrollLeft, canScrollRight }
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
    }
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (observer) observer.disconnect();
    };
  }, [update, contentKey]);

  return {
    ref,
    update,
    canScrollLeft: edges.canScrollLeft,
    canScrollRight: edges.canScrollRight,
    overflowing: edges.canScrollLeft || edges.canScrollRight
  };
};
