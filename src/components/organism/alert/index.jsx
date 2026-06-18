import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import PropTypes from "prop-types";
import Modal from "@/components/organism/modal";

function ConfirmModal({ title, confirmText, cancelText, onResolve }) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onResolve({ isConfirmed: false });
  };

  const handleConfirm = () => {
    setOpen(false);
    onResolve({ isConfirmed: true });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      type="confirm"
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      onCancel={handleClose}
    />
  );
}

ConfirmModal.propTypes = {
  title: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onResolve: PropTypes.func
};

export const DeleteAlert = {
  fire({ title, confirmText, cancelText }) {
    return new Promise((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <ConfirmModal
          title={title}
          confirmText={confirmText}
          cancelText={cancelText}
          onResolve={(result) => {
            root.unmount();
            container.remove();
            resolve(result);
          }}
        />
      );
    });
  }
};
