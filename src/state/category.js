import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const categorySelect = create(
  persist(
    (set) => ({
      category: "All",
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
