import React from "react";

const Modal = ({ children, colorBgModal = "bg-gray-900" }) => {
  return (
    <div className="fixed z-10 overflow-y-auto top-0 w-full left-0">
      <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className={`absolute inset-0 ${colorBgModal} opacity-75`} />
          <div className="h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
