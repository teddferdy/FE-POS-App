import React, { useLayoutEffect, useRef } from "react";
import PropTypes from "prop-types";
import { renderReceiptElement } from "@/utils/receiptDocument";

// On-screen receipt: mounts the very element the printer receives
// (renderReceiptElement), on a white "paper" at its real paper width.
// `zoom` only enlarges it for reading; the proportions stay the printed ones.
const ReceiptPaper = ({ data, zoom = 1.25, className = "" }) => {
  const hostRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren(renderReceiptElement(data, host.ownerDocument));
  }, [data]);

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        ref={hostRef}
        data-testid="receipt-paper"
        className="bg-white shadow-md ring-1 ring-black/10"
        style={{ zoom }}
      />
    </div>
  );
};

ReceiptPaper.propTypes = {
  data: PropTypes.object.isRequired,
  zoom: PropTypes.number,
  className: PropTypes.string
};

export default ReceiptPaper;
