import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



export const metadata = {
  title: "CarGuy Mechanics Dealership",
  description: "Car Enthusiasts Dealership, guarntee you with great prices and selection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-zinc-50 font-sans dark:bg-black"
      >
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}

function Navigation {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
        <Car className="text-blue-600" size={32} />
        <span className="text-2xl font-bold text-black dark:text-white">CarGuy Mechanics Dealership</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-black dark:text-white hover:text-blue-600 transition">Home</a>
          <a href="/inventory" className="text-black dark:text-white hover:text-blue-600 transition">Inventory</a>
          <a href="/contact" className="text-black dark:text-white hover:text-blue-600 transition">Contact</a>
          <a href="/cart" className="text-black dark:text-white hover:text-blue-600 transition">Cart</a>
        </div>
      </div>
    </nav>
  );
}

function Footer {
  
} 



