import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
import MicrosoftClarity from "@/components/MicrosoftClarity";



const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `${config.siteName} - ${config.siteSubtitle}`,
  description: config.siteDescription,
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
          <SpeedInsights />
          <MicrosoftClarity projectId={config.clarityProjectId} />
        </CartProvider>


      </body>
    </html>
  );
}
