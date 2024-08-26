import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const translationSelect = create(
  persist(
    (set) => ({
      translation: "id",
      updateTranslation: (translation) => {
        return set({
          translation: translation
        });
      }
    }),
    {
      name: "translation",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
