const variantStyles = {
  default: {
    card: "bg-card border border-border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    subtitle: "text-primary",
    label: "text-muted-foreground",
    value: "text-foreground"
  },
  active: {
    card: "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    subtitle: "text-green-600 dark:text-green-400",
    label: "text-green-700 dark:text-green-400",
    value: "text-green-900 dark:text-green-100"
  },
  inactive: {
    card: "bg-red-600 dark:bg-red-900",
    iconBg: "bg-red-700 dark:bg-red-950",
    iconColor: "text-white",
    subtitle: "text-red-100",
    label: "text-red-100",
    value: "text-white"
  },
  draft: {
    card: "bg-amber-600 dark:bg-amber-900",
    iconBg: "bg-amber-700 dark:bg-amber-950",
    iconColor: "text-white",
    subtitle: "text-amber-100",
    label: "text-amber-100",
    value: "text-white"
  },
  gray: {
    card: "bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800",
    iconBg: "bg-gray-200 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    subtitle: "text-gray-600 dark:text-gray-400",
    label: "text-gray-600 dark:text-gray-400",
    value: "text-gray-900 dark:text-gray-100"
  },
  blue: {
    card: "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    subtitle: "text-blue-600 dark:text-blue-400",
    label: "text-blue-700 dark:text-blue-400",
    value: "text-blue-900 dark:text-blue-100"
  },
  yellow: {
    card: "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    subtitle: "text-yellow-600 dark:text-yellow-400",
    label: "text-yellow-700 dark:text-yellow-400",
    value: "text-yellow-900 dark:text-yellow-100"
  },
  red: {
    card: "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    subtitle: "text-red-600 dark:text-red-400",
    label: "text-red-700 dark:text-red-400",
    value: "text-red-900 dark:text-red-100"
  },
  gold: {
    card: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    subtitle: "text-amber-600 dark:text-amber-400",
    label: "text-amber-700 dark:text-amber-400",
    value: "text-amber-900 dark:text-amber-100"
  }
};

const StatCard = ({ label, value, icon, subtitle, variant = "default", "data-tour": dataTour }) => {
  const s = variantStyles[variant] || variantStyles.default;
  return (
    <div
      data-tour={dataTour}
      className={`${s.card} p-6 rounded-xl shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow`}>
      <div>
        <p className={`text-xs font-semibold ${s.label} uppercase tracking-wider mb-1`}>{label}</p>
        <h3 className={`text-3xl font-bold ${s.value}`}>{value}</h3>
        {subtitle && (
          <p className={`text-xs font-semibold ${s.subtitle} flex items-center gap-1 mt-1`}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center ${s.iconColor} group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;
