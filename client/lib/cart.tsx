"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import type { Cart } from "./types";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const c = await api.cart();
      setCart(c);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity = 1) => {
    const c = await api.addToCart(productId, quantity);
    setCart(c);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const c = await api.updateCartItem(itemId, quantity);
    setCart(c);
  };

  const removeItem = async (itemId: number) => {
    const c = await api.removeCartItem(itemId);
    setCart(c);
  };

  const clearCart = async () => {
    await api.clearCart();
    setCart({ id: 0, items: [], total_price: "0", total_items: 0 });
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}
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
