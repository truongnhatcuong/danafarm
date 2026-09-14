import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Giỏ hàng | DanaFarm",
  description: "Xem và quản lý giỏ hàng DanaFarm của bạn.",
};

export default function CartPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
      <Container className="py-8 md:py-12">
        <h1 className="mb-6 text-2xl font-bold uppercase text-shop-title md:text-3xl">
          Giỏ hàng của bạn
        </h1>
        <CartPageClient />
      </Container>
    </>
  );
}
