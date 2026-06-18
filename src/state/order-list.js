import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const orderList = create(
  persist(
    (set, get) => ({
      order: [],
      addOrder: (product) => {
        const id = product.id || product.ID || product.idProduct || product._id;
        const existing = get().order.find((item) => (item.id || item.ID || item.idProduct || item._id) === id);
        if (existing) {
          return set((state) => ({
            order: state.order.map((item) => {
              if ((item.id || item.ID || item.idProduct || item._id) === id) {
                return {
                  ...item,
                  count: (item.count || 0) + 1,
                  totalPrice: Number(item.totalPrice || 0) + Number(product.price || product.sellPrice || 0)
                };
              }
              return item;
            })
          }));
        }
        const price = Number(product.price || product.sellPrice || 0);
        return set((state) => ({
          order: [...state.order, {
            id,
            nameProduct: product.nameProduct || product.name,
            price,
            count: 1,
            totalPrice: price,
            image: product.image || product.imageProduct || product.photo || null,
            unit: product.unit || "",
            sku: product.sku || "",
            point: product.point || 0,
            redeemPoints: product.redeemPoints || 0
          }]
        }));
      },
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
        const deleteKey = deleteItems?.cartKey || deleteItems?.id;
        return set((state) => {
          return {
            order: state.order.filter((items) => {
              const itemKey = items?.cartKey || items?.id;
              return itemKey !== deleteKey;
            })
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
      },

      // Update Item Price (override)
      updateItemPrice: (target, newPrice) => {
        return set((state) => {
          return {
            order: state.order.map((items) => {
              const matchKey = target.cartKey || target.id;
              const itemKey = items.cartKey || items.id;
              if (itemKey === matchKey) {
                return {
                  ...items,
                  price: Number(newPrice),
                  totalPrice: Number(newPrice) * (items.count || 1)
                };
              }
              return { ...items };
            })
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
