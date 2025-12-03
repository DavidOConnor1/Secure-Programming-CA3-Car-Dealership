'use client';

import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, loading, removeFromCart, clearCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  if (cart.count === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingCart className="text-gray-400 mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some vehicles to get started!</p>
        <Link
          href="/inventory"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Browse Vehicles
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax + 500; // $500 documentation fee

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart ({cart.count} items)</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 flex items-center gap-2"
        >
          <Trash2 size={20} />
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items - Left side */}
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.year} • {item.color}</p>
                    <p className="text-xl font-bold mt-2">${item.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.vehicle_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-gray-700">Qty: {item.quantity}</span>
                  <span className="font-bold">
                    Total: ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Right side */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (7.5%)</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Documentation Fee</span>
                <span>$500</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Checkout would proceed here!')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/inventory"
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-bold text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}