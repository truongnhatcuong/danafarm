import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Quicksand } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DanaFarm - Nông Trại Cầu Đất | Trà Ngon & Cà Phê Sạch",
  description:
    "DanaFarm - Trà Ngon & Cà Phê Sạch từ Cầu Đất, Đà Lạt. Chuyên cung cấp trà, cà phê, bột matcha và đặc sản Đà Lạt chất lượng cao.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${quicksand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-shop-bg text-shop-text">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
