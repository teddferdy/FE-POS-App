/* eslint-disable react/prop-types */
import * as React from "react";
import { Check, X } from "lucide-react";

function Badge({ isActive }) {
  return (
    <div className="flex justify-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold">
      {/* Conditional icon */}
      {isActive ? (
        <Check className="text-green-700" />
      ) : (
        <div className="flex justify-center w-fit h-6 bg-red-700 rounded-full">
          <X className="text-white" />
        </div>
      )}
    </div>
  );
}

export { Badge };
