"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart-store";
import type { ProductVariant } from "@/types";

export function ProductVariantSelector({
  product,
  variants,
}: {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    unitLabel: string | null;
    imageUrl: string | null;
    stock: number;
  };
  variants: ProductVariant[];
}) {
  const [selected, setSelected] = useState<ProductVariant | null>(
    variants[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const activeUserId = useCartStore((state) => state.activeUserId);
  const displayPrice = selected ? selected.price : product.price;

  function handleAddToCart() {
    if (activeUserId === null) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Sản phẩm hiện đã hết hàng.");
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selected?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantName: selected?.name ?? null,
        imageUrl: product.imageUrl,
        unitLabel: product.unitLabel,
        price: displayPrice,
      },
      quantity,
    );
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`);
  }

  function updateQuantity(value: number) {
    setQuantity(
      Math.min(Math.max(1, Math.floor(value) || 1), Math.max(1, product.stock)),
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-5 rounded-lg bg-shop-bg px-4 py-5">
        <span className="text-sm font-semibold text-shop-title">Giá:</span>
        <span className="text-2xl font-bold text-red-600 md:text-3xl">
          {formatCurrency(displayPrice)}
        </span>
        {selected?.compareAtPrice &&
          selected.compareAtPrice > selected.price && (
            <span className="text-base text-shop-text/50 line-through">
              {formatCurrency(selected.compareAtPrice)}
            </span>
          )}
      </div>

      {variants.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium text-shop-title mb-2">Phân loại</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  selected?.id === v.id
                    ? "border-shop-main bg-shop-main text-white"
                    : "border-shop-border text-shop-text hover:border-shop-main"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 flex items-center gap-5">
        <span className="text-sm font-semibold text-shop-title">Số lượng:</span>
        <div className="flex h-11 items-center border border-shop-border bg-white">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1 || product.stock <= 0}
            className="flex size-11 items-center justify-center text-xl text-shop-text/55 transition-colors hover:text-shop-main disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={Math.max(1, product.stock)}
            value={quantity}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            disabled={product.stock <= 0}
            className="h-full w-14 border-x border-shop-border text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Số lượng sản phẩm"
          />
          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= product.stock || product.stock <= 0}
            className="flex size-11 items-center justify-center text-xl text-shop-text/55 transition-colors hover:text-shop-main disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <span className="text-xs text-shop-text/55">
          Còn {product.stock} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          variant="outline"
          className="w-full uppercase"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          Thêm vào giỏ
        </Button>
        <Button
          size="lg"
          className="w-full uppercase"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
