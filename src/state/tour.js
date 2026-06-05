import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTourStore = create(
  persist(
    (set) => ({
      isActive: false,
      currentStep: 0,
      isMinimized: false,
      isCompleted: false,
      startTour: () => set({ isActive: true, currentStep: 0, isMinimized: false }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      endTour: () =>
        set({
          isActive: false,
          currentStep: 0,
          isMinimized: false,
          isCompleted: true
        }),
      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
      setStep: (step) => set({ currentStep: step }),
      resetTour: () =>
        set({
          isActive: false,
          currentStep: 0,
          isMinimized: false,
          isCompleted: false
        })
    }),
    {
      name: "super-admin-tour",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
