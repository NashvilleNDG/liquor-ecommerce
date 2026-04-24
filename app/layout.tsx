import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { OrderHistoryProvider } from "@/context/OrderHistoryContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import CartDrawer from "@/components/CartDrawer";
import AgeVerification from "@/components/AgeVerification";
import AuthProvider from "@/components/AuthProvider";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stones River Total Beverages — Shop Online",
  description: "Premium liquor, beer, wine and spirits in Murfreesboro, TN. 7,000+ products, same-day pickup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${rubik.variable} ${nunitoSans.variable} font-sans bg-white text-stone-900 min-h-screen antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <OrderHistoryProvider>
                    <LoyaltyProvider>
                      <AgeVerification />
                      <CartDrawer />
                      {children}
                    </LoyaltyProvider>
                  </OrderHistoryProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
