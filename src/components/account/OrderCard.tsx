"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, RotateCcw, ExternalLink } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export interface OrderItemData {
  id: number;
  productId: number;
  productName: string;
  variantName: string | null;
  imageUrl: string | null;
  unitLabel: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderCardData {
  id: number;
  code: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: Date | string;
  items: OrderItemData[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PACKING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPING: "bg-sky-50 text-sky-700 border-sky-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

function OrderItemThumbnail({
  imageUrl,
  productName,
}: {
  imageUrl: string | null;
  productName: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className="flex size-full items-center justify-center text-shop-text/30">
        <Package size={28} />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={productName}
      fill
      sizes="(max-width: 640px) 80px, 96px"
      loading="lazy"
      unoptimized
      onError={() => setHasError(true)}
      className="object-contain p-1 transition-transform duration-200 group-hover:scale-105"
    />
  );
}

interface OrderCardProps {
  order: OrderCardData;
}

export function OrderCard({ order }: OrderCardProps) {
  const isCancelled = order.status === "CANCELLED";
  const orderUrl = `/account/orders/${order.code}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-shop-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header: Order Code & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-shop-border/70 bg-gray-50/70 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={orderUrl}
            className="font-bold text-shop-title hover:text-shop-main hover:underline"
          >
            #{order.code}
          </Link>
          <span className="text-shop-text/40">·</span>
          <span className="text-xs text-shop-text/60">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {order.paymentMethod === "BANK_TRANSFER" && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-medium",
                order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              VietQR:{" "}
              {order.paymentStatus === "PAID"
                ? "Đã thanh toán"
                : "Chờ thanh toán"}
            </span>
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
            STATUS_CLASS[order.status] ??
              "border-gray-200 bg-gray-100 text-gray-700",
          )}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* Items list (Shopee style) */}
      <div className="divide-y divide-gray-100">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-3.5 p-4 transition-colors hover:bg-slate-50/50 sm:gap-4 sm:p-5"
          >
            {/* Ảnh phía ngoài */}
            <Link
              href={orderUrl}
              className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-shop-border/80 bg-shop-bg sm:size-24"
            >
              <OrderItemThumbnail
                imageUrl={item.imageUrl}
                productName={item.productName}
              />
            </Link>

            {/* Thông tin sản phẩm: Tên + Phân loại/Đơn vị + Số lượng */}
            <div className="min-w-0 flex-1">
              <Link
                href={orderUrl}
                className="line-clamp-2 text-sm font-semibold text-shop-title transition-colors hover:text-shop-main sm:text-base"
              >
                {item.productName}
              </Link>

              {item.variantName && (
                <p className="mt-1 text-xs text-shop-text/60">
                  Phân loại:{" "}
                  <span className="text-shop-text/80">{item.variantName}</span>
                </p>
              )}

              {item.unitLabel && !item.variantName && (
                <p className="mt-1 text-xs text-shop-text/60">
                  Quy cách:{" "}
                  <span className="text-shop-text/80">{item.unitLabel}</span>
                </p>
              )}

              <p className="mt-1.5 text-xs font-medium text-shop-text/70">
                x{item.quantity}
              </p>
            </div>

            {/* Giá */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-shop-title sm:text-base">
                {formatCurrency(item.price)}
              </p>
              {item.quantity > 1 && (
                <p className="mt-0.5 text-xs text-shop-text/50">
                  Tổng: {formatCurrency(item.lineTotal)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Tổng tiền + Nút hành động */}
      <div className="border-t border-shop-border/70 bg-gray-50/40 p-4 sm:px-6">
        {/* Tổng số tiền */}
        <div className="flex items-baseline justify-end gap-2.5 pb-3 sm:pb-4">
          <span className="text-sm text-shop-text/75">Thành tiền:</span>
          <span className="text-lg font-bold text-shop-main sm:text-xl">
            {formatCurrency(order.total)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
          {/* Nút Xem chi tiết */}
          <Link
            href={orderUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-shop-border bg-white px-4 py-2 text-sm font-medium text-shop-title transition-colors hover:border-shop-main hover:bg-shop-bg hover:text-shop-main"
          >
            <ExternalLink size={15} />
            Xem chi tiết
          </Link>

          {/* Nếu có hủy có button mua lại trỏ tới đơn hàng đó */}
          {isCancelled && (
            <Link
              href={orderUrl}
              className="inline-flex items-center gap-1.5 rounded-xl bg-shop-main px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-shop-main-dark hover:shadow-md active:scale-95"
            >
              <RotateCcw size={15} />
              Mua lại
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
