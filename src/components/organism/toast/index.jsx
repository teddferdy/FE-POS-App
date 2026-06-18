import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import PropTypes from "prop-types";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800"
};

function ToastItem({ icon, title, onClose }) {
  const Icon = iconMap[icon] || Info;

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in ${colorMap[icon] || colorMap.info}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{title}</span>
      <button onClick={onClose} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func
};

function mountToast({ icon, title }) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const unmount = () => {
    root.unmount();
    container.remove();
  };

  root.render(<ToastItem icon={icon} title={title} onClose={unmount} />);
}

export const Toast = {
  fire({ icon = "info", title }) {
    mountToast({ icon, title });
  }
};
