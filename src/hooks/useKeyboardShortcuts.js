import { useEffect } from "react";

// ponytail: global keyboard shortcuts, no per-page config needed
// upgrade: add configurable key-to-action map if more shortcuts are needed
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "s") {
        e.preventDefault();
        document.querySelector('[type="submit"]')?.click();
      }

      if (mod && e.key === "n") {
        e.preventDefault();
        const addBtn = document.querySelector('[href*="/add-"], a[href*="/tambah-"]');
        if (addBtn) {
          addBtn.click();
          return;
        }
        const m = window.location.pathname.match(/\/(.+?)(?:\/|$)/);
        if (m) window.location.href = `/add-${m[1].replace(/-list$/, "")}`;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
};

export default useKeyboardShortcuts;
