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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#ef4444",
        color: "#fff",
        textAlign: "center",
        padding: "8px 16px",
        fontSize: 14,
        fontWeight: 600
      }}>
      {t("offline.message")}
    </div>
  );
};

export default OfflineIndicator;
