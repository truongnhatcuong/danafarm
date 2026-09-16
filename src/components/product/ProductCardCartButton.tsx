"use client";

import { ShoppingCart } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { animateProductToCart } from "@/lib/cart-animation";
import { useCartStore, type CartItemInput } from "@/stores/cart-store";

export function ProductCardCartButton({
  item,
  stock,
}: {
  item: CartItemInput;
  stock: number;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const activeUserId = useCartStore((state) => state.activeUserId);

  function handleAdd() {
    if (activeUserId === null) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }
    if (stock <= 0) {
      toast.error("Sản phẩm hiện đã hết hàng.");
      return;
    }

    addItem(item, 1);
    animateProductToCart(buttonRef.current, item.imageUrl);
    toast.success("Đã thêm sản phẩm vào giỏ hàng.");
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleAdd}
      disabled={stock <= 0}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-shop-main px-3 py-2.5 text-[0.6rem] md:text-xs lg:text-base font-bold uppercase text-white transition hover:bg-shop-hover active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-300"
      aria-label={`Thêm ${item.name} vào giỏ hàng`}
    >
      <ShoppingCart size={16} />
      {stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
    </button>
  );
}
