"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartHeaderLink({ mobile = false }: { mobile?: boolean }) {
  const hydrated = useCartStore((state) => state.hydrated);
  const activeUserId = useCartStore((state) => state.activeUserId);
  const quantity = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const count = hydrated && activeUserId !== null ? quantity : 0;

  if (mobile) {
    return (
      <Link
        href="/cart"
        data-cart-target
        className="relative flex items-center justify-center p-2 text-white transition-colors hover:text-white/80"
        aria-label={`Giỏ hàng có ${count} sản phẩm`}
      >
        <ShoppingBag size={24} />
        {count > 0 && (
          <span className="absolute right-0 top-0 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      data-cart-target
      className="relative flex items-center gap-2 px-5 text-sm hover:text-white/80"
      aria-label={`Giỏ hàng có ${count} sản phẩm`}
    >
      <ShoppingBag size={29} /> <b>Giỏ hàng</b>
      <span className="absolute left-10 top-[-8px] flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
