import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const orderList = create(
  persist(
    (set, get) => ({
      order: [],
      addOrder: (product) => {
        const id = product.id || product.ID || product.idProduct || product._id;
        const cartKey = `${id}_${product.variantName || ""}`;
        const existing = get().order.find((item) => item.cartKey === cartKey);
        if (existing) {
          // F9-02: increment by this line's own current price, not the
          // catalog price passed in — a line's price can have diverged from
          // the catalog via an authorized override (updateItemPrice), and
          // re-adding the same product must keep totalPrice = price * count.
          return set((state) => ({
            order: state.order.map((item) => {
              if (item.cartKey === cartKey) {
                return {
                  ...item,
                  count: (item.count || 0) + 1,
                  totalPrice: Number(item.totalPrice || 0) + Number(item.price || 0)
                };
              }
              return item;
            })
          }));
        }
        const price = Number(product.price || product.sellPrice || 0);
        return set((state) => ({
          order: [
            ...state.order,
            {
              id,
              cartKey,
              nameProduct: product.nameProduct || product.name,
              variantName: product.variantName || null,
              price,
              count: 1,
              totalPrice: price,
              image: product.image || product.imageProduct || product.photo || null,
              unit: product.unit || "",
              sku: product.sku || "",
              point: product.point || 0,
              redeemPoints: product.redeemPoints || 0
            }
          ]
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
              if (items.cartKey === decrementOrder.cartKey) {
                return {
                  ...items,
                  count: items.count - 1,
                  totalPrice: Number(items.totalPrice) - Number(items.price)
                };
              } else {
                // F9-08: keep the same reference for every other line so a
                // memoized cart row can bail on re-rendering via a plain
                // reference-equality check on its own `item` prop.
                return items;
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
              if (items.cartKey === incrementOrder.cartKey) {
                return {
                  ...items,
                  count: items.count + 1,
                  totalPrice: Number(items.totalPrice) + Number(items.price)
                };
              } else {
                return items;
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

      // Update Item Price (override) — F7-01: reject non-finite/negative
      // values here too, not just in the CartPanel UI, so this action can
      // never leave the cart in a NaN/negative-price state no matter what
      // calls it.
      updateItemPrice: (target, newPrice) => {
        if (newPrice === "" || newPrice === null || newPrice === undefined) return;
        const price = Number(newPrice);
        if (!Number.isFinite(price) || price < 0) return;
        return set((state) => {
          return {
            order: state.order.map((items) => {
              const matchKey = target.cartKey || target.id;
              const itemKey = items.cartKey || items.id;
              if (itemKey === matchKey) {
                return {
                  ...items,
                  price,
                  totalPrice: price * (items.count || 1)
                };
              }
              return items;
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
