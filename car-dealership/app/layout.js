

import './globals.css';
import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import Navigation from './components/Navigation';



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
        <CartProvider>
        <Navigation />
        {children}
        <Footer />
</CartProvider>
      </body>
    </html>
  );
}



function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
                <Car className="text-blue-400" size={32} />
                <span className="text-2xl font-bold">CarGuy Mechanics Dealership</span>
            </div>
            <p className="text-gray-400">
              A Burning Passion for Cars Since 1985
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/inventory" className="hover:text-white transition">Browse Inventory</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="/" className="hover:text-white transition">Home</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>085 111 1111</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>info@carguymechanics.ie</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>123 Driving Town, Dublin 2, Dublin </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
            <div className="space-y-2 text-gray-400">
              <p>Mon-Fri: 9:00 AM - 8:00 PM</p>
              <p>Saturday: 9:00 AM - 6:00 PM</p>
              <p>Sunday: 11:00 AM - 5:00 PM</p>
            </div>
          </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>{new Date().getFullYear()} CarGuy Mechanics Dealership. All Rights Reserved</p>
        </div>
        </div>
      </div>
    </footer>
  );
} 



