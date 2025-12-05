"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error fetching Cart: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (vehicle) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id, quantity: 1 }),
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  };

  const removeFromCart = async (vehicleId) => {
    try {
      const response = await fetch(`/api/cart?vehicleId=${vehicleId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error removing from cart: ", error);
    }
  };

  const updateQuantity = async (vehicleId, quantity) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, quantity }),
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  const clearCart = async () => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
      });
      setCart({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error("Error clearing cart: ", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
