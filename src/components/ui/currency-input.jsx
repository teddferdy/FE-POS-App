import React from "react";
import { Input } from "@/components/ui/input";

const CurrencyInput = ({ value, onChange, placeholder = "0", className = "", ...props }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
      Rp
    </span>
    <Input
      type="text"
      inputMode="numeric"
      className={`pl-10 ${className}`}
      placeholder={placeholder}
      value={value ? Number(value).toLocaleString("id-ID") : ""}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        onChange(raw ? Number(raw) : "");
      }}
      {...props}
    />
  </div>
);

export default CurrencyInput;
