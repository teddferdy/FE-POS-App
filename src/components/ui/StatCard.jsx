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
    card: "bg-card border border-border",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    subtitle: "text-green-600 dark:text-green-400",
    label: "text-muted-foreground",
    value: "text-foreground"
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
