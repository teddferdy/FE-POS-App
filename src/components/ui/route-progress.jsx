import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const RouteProgress = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setProgress(30);
      setVisible(true);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
      }, 200);
    }
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouteProgress;
