import React, { useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { renderReceiptElement } from "@/utils/receiptDocument";

// On-screen receipt: mounts the very element the printer receives
// (renderReceiptElement), on a white "paper" at its real paper width.
// `zoom` only enlarges it for reading; the proportions stay the printed ones.
// With `fit`, the zoom shrinks (down to 0.75) so the paper never overflows a
// narrow container (a phone-width modal) — `zoom` is then the maximum.
const PAPER_PX = { "58mm": 219, "80mm": 302 }; // mm at 96 dpi
const ReceiptPaper = ({ data, zoom = 1.25, fit = false, className = "" }) => {
  const hostRef = useRef(null);
  const outerRef = useRef(null);
  const [fitZoom, setFitZoom] = useState(zoom);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!fit || !outer) return undefined;
    const paper = PAPER_PX[data?.paperSize] || PAPER_PX["58mm"];
    const update = () => {
      const width = outer.clientWidth;
      if (!width) return;
      setFitZoom(Math.max(0.75, Math.min(zoom, (width - 8) / paper)));
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [fit, zoom, data?.paperSize]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren(renderReceiptElement(data, host.ownerDocument));
  }, [data]);

  return (
    <div ref={outerRef} className={`flex justify-center ${className}`}>
      <div
        ref={hostRef}
        data-testid="receipt-paper"
        className="bg-white shadow-md ring-1 ring-black/10"
        style={{ zoom: fit ? fitZoom : zoom }}
      />
    </div>
  );
};

ReceiptPaper.propTypes = {
  data: PropTypes.object.isRequired,
  zoom: PropTypes.number,
  fit: PropTypes.bool,
  className: PropTypes.string
};

export default ReceiptPaper;
