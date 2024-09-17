import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const orderList = create(
  persist(
    (set) => ({
      order: [],
      addingProduct: (item) => {
        return set((state) => {
          return {
            order: [...state.order, item]
          };
        });
      },

      // Decrement Product
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

      // Increment Product
      incrementOrder: (incrementOrder) => {
        return set((state) => {
          return {
            order: state.order.map((items) => {
              console.log("ITEMS =>", items);
              // console.log("counTotal =>", counTotal);
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

      // Delete Product
      handleDeleteOrder: (deleteItems) => {
        return set((state) => {
          return {
            order: state.order.filter((items) => items?.id !== deleteItems?.id)
          };
        });
      },

      // Update Choose Option Product
      handleUpdateOptionProduct: (val, option, idOrder) => {
        return set((state) => {
          return {
            order: state.order.map((items) => {
              if (items?.id === idOrder) {
                return {
                  ...items,
                  options: items.options.map((opt) => {
                    if (opt?.nameSubCategory === option?.nameSubCategory && option?.isMultiple) {
                      return {
                        ...opt,
                        option: val
                          ? [...opt.option, option]
                          : opt.option.filter((value) => value.name !== option.name)
                      };
                    } else if (
                      opt?.nameSubCategory === option?.nameSubCategory &&
                      !option?.isMultiple
                    ) {
                      return {
                        ...opt,
                        option: option.option,
                        value: val,
                        dataOption: option.dataOption
                      };
                    } else {
                      return { ...opt };
                    }
                  })
                };
              } else {
                return { ...items };
              }
            })
          };
        });
      },

      // Reset Order After Checkout
      resetOrder: () => {
        return set(() => {
          return {
            order: []
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
