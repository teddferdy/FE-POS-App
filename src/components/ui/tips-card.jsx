/* eslint-disable react/prop-types */
import { Lightbulb, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground",
  info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
  warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
};

const variantIcons = {
  default: Lightbulb,
  info: Info,
  warning: AlertTriangle
};

const TipsCard = ({ tips = [], title = "Tips", variant = "default", className }) => {
  const Icon = variantIcons[variant];
  return (
    <div className={cn("rounded-xl p-5 flex flex-col", variantStyles[variant], className)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} className="opacity-80" />
        <h4 className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</h4>
      </div>
      <div className="flex-1">
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="text-xs leading-relaxed opacity-90 flex items-start gap-2">
              <span className="opacity-60 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export { TipsCard };
