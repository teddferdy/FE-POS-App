import { useEffect } from "react";

// ponytail: refcount agar beberapa modal/drawer bisa membuka lock bersamaan
// tanpa saling mengembalikan overflow body sebelum semua tertutup
let lockCount = 0;
let prevOverflow = "";
let prevPaddingRight = "";

export const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;

    if (lockCount === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      prevOverflow = document.body.style.overflow;
      prevPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      // ponytail: kompensasi lebar scrollbar agar konten tidak "loncat" saat lock aktif
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      }
    };
  }, [locked]);
};

export default useBodyScrollLock;
