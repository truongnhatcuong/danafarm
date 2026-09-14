"use client";

import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatVnd, type Product, type ProductMeta } from "./types";

function StockBadge({ quantity }: { quantity: number }) {
  const inStock = quantity > 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        inStock
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-600"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`}
      />
      {inStock ? `Còn hàng (${quantity})` : "Hết hàng"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-admin-accent-soft text-admin-accent"
          : "bg-slate-200 text-slate-600"
      }`}
    >
      {active ? "Hiển thị" : "Nháp"}
    </span>
  );
}

export function ProductTable({
  items,
  meta,
  onPageChange,
  onEdit,
  onDelete,
}: {
  items: Product[];
  meta: ProductMeta;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <section className="rounded-2xl border border-admin-border bg-admin-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border text-xs font-medium text-admin-muted">
            <tr>
              <th className="p-4 font-medium">Sản phẩm</th>
              <th className="font-medium">Giá</th>
              <th className="font-medium">Danh mục</th>
              <th className="font-medium">Số lượng</th>
              <th className="font-medium">Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-sm text-admin-muted"
                >
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
            {items.map((product) => {
              const cover = product.images[0];
              return (
                <tr
                  key={product.id}
                  className="border-b border-admin-border last:border-none"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={cover.alt ?? product.name}
                          className="size-11 shrink-0 rounded-xl border border-admin-border object-cover"
                        />
                      ) : (
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-admin-bg text-admin-muted">
                          <ImageOff size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-admin-ink">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-admin-muted">
                          {product.sku || product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-admin-ink">
                      {formatVnd(product.price)}
                    </div>
                    {product.compareAtPrice != null &&
                      product.compareAtPrice > product.price && (
                        <div className="text-xs text-admin-muted line-through">
                          {formatVnd(product.compareAtPrice)}
                        </div>
                      )}
                  </td>
                  <td className="text-admin-muted">
                    {product.categories.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td>
                    <StockBadge quantity={product.quantity} />
                  </td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Sửa ${product.name}`}
                        onClick={() => onEdit(product)}
                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-accent-soft hover:text-admin-accent"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa ${product.name}`}
                        onClick={() => onDelete(product)}
                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 text-sm text-admin-muted">
        <span>{meta.total} sản phẩm</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="grid size-8 place-items-center rounded-lg border border-admin-border disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-admin-ink">
            {meta.page}/{meta.pageCount}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={meta.page >= meta.pageCount}
            onClick={() => onPageChange(meta.page + 1)}
            className="grid size-8 place-items-center rounded-lg border border-admin-border disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
