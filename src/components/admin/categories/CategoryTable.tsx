"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { Category, CategoryMeta } from "./types";

const fieldClass =
  "rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent";

const sortOptions = [
  { value: "position", label: "Vị trí" },
  { value: "name", label: "Tên" },
  { value: "createdAt", label: "Ngày tạo" },
  { value: "updatedAt", label: "Cập nhật" },
] as const;

export function CategoryTable({
  items,
  meta,
  search,
  onSearchChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
  onPageChange,
  onEdit,
  onDelete,
}: {
  items: Category[];
  meta: CategoryMeta;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  direction: string;
  onDirectionChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: Category) => void;
  onDelete: (item: Category) => void;
}) {
  return (
    <section className="rounded-2xl border border-admin-border bg-admin-surface">
      <div className="flex items-center gap-2.5 border-b border-admin-border p-4">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
          />

          <input
            className={`${fieldClass} w-full pl-9`}
            placeholder="Tìm tên, slug, mô tả..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Sort */}
        <select
          className={`${fieldClass} shrink-0`}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Direction */}
        <select
          className={`${fieldClass} shrink-0`}
          value={direction}
          onChange={(e) => onDirectionChange(e.target.value)}
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-admin-border text-xs font-medium text-admin-muted">
            <tr>
              <th className="p-4 font-medium">Danh mục</th>
              <th className="font-medium">Danh mục cha</th>
              <th className="font-medium">Sản phẩm</th>
              <th className="font-medium">Vị trí</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-sm text-admin-muted"
                >
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-admin-border last:border-none"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={44}
                        height={44}
                        className="size-11 shrink-0 rounded-xl border border-admin-border object-cover"
                      />
                    ) : (
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-admin-bg text-admin-muted">
                        <ImageOff size={16} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-admin-ink">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-admin-muted">
                        {item.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-admin-muted">{item.parent?.name ?? "—"}</td>
                <td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-admin-accent-soft px-2.5 py-1 text-xs font-semibold text-admin-accent">
                      {item._count?.products ?? 0} sản phẩm
                    </span>
                    {!!item._count?.children && (
                      <span className="rounded-full bg-admin-bg px-2.5 py-1 text-xs font-medium text-admin-muted">
                        {item._count.children} danh mục con
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-admin-muted">{item.position}</td>
                <td className="p-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Sửa ${item.name}`}
                      onClick={() => onEdit(item)}
                      className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-accent-soft hover:text-admin-accent"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa ${item.name}`}
                      onClick={() => onDelete(item)}
                      className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 text-sm text-admin-muted">
        <span>{meta.total} danh mục</span>
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
