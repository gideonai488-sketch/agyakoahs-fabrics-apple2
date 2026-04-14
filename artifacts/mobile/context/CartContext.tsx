import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "@shopping_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  async function loadCart() {
    try {
      const json = await AsyncStorage.getItem(CART_KEY);
      if (json) setItems(JSON.parse(json));
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }

  function addItem(product: Omit<CartItem, "id" | "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          ...product,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
