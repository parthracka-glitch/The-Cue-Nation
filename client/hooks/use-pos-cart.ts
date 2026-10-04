import { useState, useCallback } from "react";
import { MenuItem } from "../api/pos.api";

export interface PosCartItem {
  menuItemId: string;
  name: string;
  pricePaise: number;
  quantity: number;
  notes: string;
  assignedToPlayer: string;
}

export function usePosCart() {
  const [cart, setCart] = useState<PosCartItem[]>([]);

  const addToCart = useCallback((item: MenuItem, assignedPlayer = "Player 1") => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.menuItemId === item.id && i.assignedToPlayer === assignedPlayer
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }

      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
          quantity: 1,
          notes: "",
          assignedToPlayer: assignedPlayer,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const target = next[index];
      if (!target) return prev;

      target.quantity += delta;
      if (target.quantity <= 0) {
        next.splice(index, 1);
      }
      return next;
    });
  }, []);

  const updateNotes = useCallback((index: number, notes: string) => {
    setCart((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index].notes = notes;
      }
      return next;
    });
  }, []);

  const updatePlayer = useCallback((index: number, assignedToPlayer: string) => {
    setCart((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index].assignedToPlayer = assignedToPlayer;
      }
      return next;
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const subtotalPaise = cart.reduce((acc, item) => acc + item.pricePaise * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    updateNotes,
    updatePlayer,
    removeFromCart,
    clearCart,
    subtotalPaise,
    totalItemsCount,
  };
}
