import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] bg-destructive text-destructive-foreground text-center py-2 px-4 text-sm font-semibold">
      {t("offline.message")}
    </div>
  );
};

export default OfflineIndicator;
