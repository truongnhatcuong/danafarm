"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export function CartPageClient() {
  const hydrated = useCartStore((state) => state.hydrated);
  const activeUserId = useCartStore((state) => state.activeUserId);
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-shop-border bg-white p-10 text-center text-shop-text/60">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (activeUserId === null) {
    return (
      <div className="rounded-2xl border border-shop-border bg-white px-5 py-14 text-center">
        <ShoppingBag className="mx-auto mb-4 text-shop-main/60" size={54} />
        <h2 className="text-xl font-bold text-shop-title">
          Vui lòng đăng nhập
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-shop-text/65">
          Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.
        </p>
        <ButtonLink href="/login" className="mt-6">
          Đăng nhập
        </ButtonLink>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-shop-border bg-white px-5 py-14 text-center">
        <ShoppingBag className="mx-auto mb-4 text-shop-main/60" size={54} />
        <h2 className="text-xl font-bold text-shop-title">
          Giỏ hàng đang trống
        </h2>
        <p className="mt-2 text-sm text-shop-text/65">
          Hãy chọn thêm những sản phẩm bạn yêu thích.
        </p>
        <ButtonLink href="/collections/all" className="mt-6">
          Tiếp tục mua sắm
        </ButtonLink>
      </div>
    );
  }

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-2xl border border-shop-border bg-white">
        <div className="border-b border-shop-border px-4 py-4 md:px-6">
          <h2 className="font-bold text-shop-title">
            Sản phẩm ({totalQuantity})
          </h2>
        </div>
        <div className="divide-y divide-shop-border">
          {items.map((item) => (
            <article
              key={item.key}
              className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 p-4 md:grid-cols-[112px_minmax(0,1fr)_140px] md:p-6"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-shop-border bg-shop-bg"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-shop-text/40">
                    Không có ảnh
                  </span>
                )}
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold text-shop-title hover:text-shop-main"
                >
                  {item.name}
                </Link>
                {item.variantName && (
                  <p className="mt-1 text-sm text-shop-text/60">
                    Phân loại: {item.variantName}
                  </p>
                )}
                {!item.variantName && item.unitLabel && (
                  <p className="mt-1 text-sm text-shop-text/60">
                    Quy cách: {item.unitLabel}
                  </p>
                )}
                <p className="mt-2 font-bold text-shop-main md:hidden">
                  {formatCurrency(item.price)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex h-10 items-center rounded-lg border border-shop-border">
                    <button
                      type="button"
                      onClick={() => decrement(item.key)}
                      disabled={item.quantity <= 1}
                      aria-label={`Giảm số lượng ${item.name}`}
                      className="flex size-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      aria-label={`Số lượng ${item.name}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        setQuantity(item.key, Number(event.target.value) || 1)
                      }
                      className="h-full w-12 border-x border-shop-border text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => increment(item.key)}
                      aria-label={`Tăng số lượng ${item.name}`}
                      className="flex size-10 items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
              <div className="hidden text-right md:block">
                <p className="font-bold text-shop-main">
                  {formatCurrency(item.price)}
                </p>
                <p className="mt-2 text-sm text-shop-text/55">Thành tiền</p>
                <p className="font-semibold text-shop-title">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-shop-border bg-white p-5 lg:sticky lg:top-5">
        <h2 className="border-b border-shop-border pb-4 text-lg font-bold text-shop-title">
          Tóm tắt giỏ hàng
        </h2>
        <div className="flex items-center justify-between py-5">
          <span className="text-shop-text/70">Tạm tính</span>
          <strong className="text-xl text-shop-main">
            {formatCurrency(subtotal)}
          </strong>
        </div>
        <p className="border-t border-shop-border pt-4 text-xs leading-5 text-shop-text/55">
          Phí vận chuyển và ưu đãi sẽ được tính ở bước đặt hàng.
        </p>
        <ButtonLink
          href="/collections/all"
          variant="outline"
          className="mt-5 w-full"
        >
          Tiếp tục mua sắm
        </ButtonLink>
      </aside>
    </div>
  );
}
