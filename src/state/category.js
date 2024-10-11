import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const categorySelect = create(
  persist(
    (set) => ({
      category: 0,
      updateCategory: (category) => {
        return set({
          category: category
        });
      }
    }),
    {
      name: "category",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
