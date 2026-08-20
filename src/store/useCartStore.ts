import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  price_npr: number;
  qty: number;
  imageUrl: string;
  /** Custom Salon Color Match add-on (+NPR 6,000, cat-spa only). Kept as its own flag rather than
   * folded into price_npr so /api/orders can independently verify and price it server-side. */
  customColorMatch: boolean;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      // Immutable Add To Cart Action
      addToCart: (newItem) => {
        const currentItems = get().cartItems;
        const existingIndex = currentItems.findIndex((item) => item.id === newItem.id);

        if (existingIndex > -1) {
          const updatedItems = currentItems.map((item, idx) => {
            if (idx === existingIndex) {
              return { ...item, qty: item.qty + (newItem.qty || 1) };
            }
            return item;
          });
          set({ cartItems: updatedItems });
        } else {
          set({
            cartItems: [...currentItems, { ...newItem, qty: newItem.qty || 1 }],
          });
        }
      },

      // Immutable Remove Action (Strictly uses .filter to remove object from array)
      removeFromCart: (id) => {
        set({
          cartItems: get().cartItems.filter((item) => item.id !== id),
        });
      },

      // Immutable Quantity Update (If qty drops to 0 or below, filter out completely)
      updateQuantity: (id, delta) => {
        set({
          cartItems: get().cartItems
            .map((item) => {
              if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        });
      },

      // Clear Cart Action
      clearCart: () => {
        set({ cartItems: [] });
      },
    }),
    {
      name: "eternity-cart-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);
