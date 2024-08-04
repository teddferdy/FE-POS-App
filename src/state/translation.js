import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import INDONESIA_FLAG from "../assets/nations/indonesia-flag.png";

export const translationSelect = create(
  persist(
    (set) => ({
      translation: "id",
      translationName: "Indonesia",
      translationImg: INDONESIA_FLAG,
      updateTranslation: (translation) => {
        return set({
          translation: translation.value,
          translationName: translation.name,
          translationImg: translation.img
        });
      }
    }),
    {
      name: "translation",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
