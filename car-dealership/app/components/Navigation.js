'use client';

import { Car, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function Navigation() {
  const { cart } = useCart();
  
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="text-blue-600" size={32} />
            <Link href="/" className="text-2xl font-bold text-black dark:text-white">
              CarGuy Mechanics
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-black dark:text-white hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/inventory" className="text-black dark:text-white hover:text-blue-600 transition">
              Inventory
            </Link>
            <Link href="/cart" className="relative text-black dark:text-white hover:text-blue-600 transition">
              Cart
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="text-black dark:text-white" size={24} />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </Link>
            <Link 
              href="/inventory" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Cars
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}