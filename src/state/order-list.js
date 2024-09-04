/* eslint-disable no-undef */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const orderList = create(
  persist(
    (set) => ({
      order: [],
      updateOrderList: (item) => {
        console.log("ITEMS =>", item);
      },

      addingProduct: (item) => {
        return set((state) => {
          return {
            order: [...state.order, item]
          };
        });
      },
      decrementOrder: (decrementOrder) => {
        return set((state) => {
          return {
            order: state.order.map((items) => {
              if (items?.id === decrementOrder?.id) {
                return {
                  ...items,
                  count: items.count - 1,
                  totalPrice: Number(items.totalPrice) - Number(items.price)
                };
              } else {
                return { ...items };
              }
            })
          };
        });
      },
      incrementOrder: (incrementOrder) => {
        return set((state) => {
          return {
            order: state.order.map((items) => {
              if (items?.id === incrementOrder?.id) {
                return {
                  ...items,
                  count: items.count + 1,
                  totalPrice: Number(items.totalPrice) + Number(items.price)
                };
              } else {
                return { ...items };
              }
            })
          };
        });
      },
      handleDeleteOrder: (deleteItems) => {
        return set((state) => {
          return {
            order: state.order.filter((items) => items?.id !== deleteItems?.id)
          };
        });
      }
    }),
    {
      name: "order-list",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
