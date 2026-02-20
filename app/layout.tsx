import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans", // keeping the variable name to perfectly map to globals.css theme
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UFBA Delivery - O seu lanche no campus",
  description: "Peça lanches, refeições e muito mais dos vendedores no campus da UFBA. Prático, rápido e feito por estudantes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
