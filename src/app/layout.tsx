import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Quicksand, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const DEFAULT_TITLE = "DanaFarm - Nông Trại Cầu Đất | Trà Ngon & Cà Phê Sạch";
const DEFAULT_DESCRIPTION =
  "DanaFarm - Trà Ngon & Cà Phê Sạch từ Cầu Đất, Đà Lạt. Chuyên cung cấp trà, cà phê, bột matcha và đặc sản Đà Lạt chất lượng cao.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | DanaFarm" },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "DanaFarm",
    "trà Đà Lạt",
    "cà phê Cầu Đất",
    "trà Oolong",
    "bột matcha",
    "đặc sản Đà Lạt",
    "trà lài",
    "trà sen",
  ],
  authors: [{ name: "DanaFarm" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "DanaFarm",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "DanaFarm" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${quicksand.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-shop-bg text-shop-text">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
