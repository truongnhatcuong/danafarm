import type { ReactNode } from "react";
import { CartSessionBridge } from "@/components/cart/CartSessionBridge";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <CartSessionBridge userId={user?.id ?? null} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
