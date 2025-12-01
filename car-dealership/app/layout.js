import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



export const metadata = {
  title: "CarGuy Dealership",
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

function Navigation (

)

function Footer (

)

