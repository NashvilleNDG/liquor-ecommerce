import type { Metadata } from "next";
import { Rubik, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import CartDrawer from "@/components/CartDrawer";
import AgeVerification from "@/components/AgeVerification";

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
  title: "LiquorStore — Shop Online",
  description: "Premium liquor, beer, and wine delivered to your door.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${nunitoSans.variable} font-sans bg-stone-50 dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 min-h-screen antialiased transition-colors duration-200`}>
        <ThemeProvider>
          <CartProvider>
            <AgeVerification />
            <CartDrawer />
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
