/* eslint-disable no-undef */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const orderList = create(
  persist(
    (set) => ({
      order: [
        {
          id: 1,
          orderName: "Nasi Goreng",
          count: 2,
          price: "14000",
          totalPrice: "28000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        },
        {
          id: 2,
          orderName: "Nasi Goreng",
          count: 3,
          price: "12000",
          totalPrice: "36000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        },
        {
          id: 3,
          orderName: "Nasi Goreng",
          count: 1,
          price: "12000",
          totalPrice: "12000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        },
        {
          id: 4,
          orderName: "Nasi Goreng",
          count: 10,
          price: "12000",
          totalPrice: "120000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        },
        {
          id: 5,
          orderName: "Nasi Goreng",
          count: 5,
          price: "12000",
          totalPrice: "60000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        },
        {
          id: 6,
          orderName: "Nasi Goreng",
          count: 20,
          price: "12000",
          totalPrice: "2400000",
          img: "https://drive.google.com/file/d/1Hkozm-NTqY6liu_a1YQkz8JN_yvu6dtr/view?usp=sharing",
          dataOrder: {
            spicy: true,
            levelSpicy: 2
          }
        }
      ],
      updateOrderList: (order) => {
        console.log("ORDER =>", order);

        // return set({
        //   translation: translation
        // });
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
