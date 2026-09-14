"use client";

import { FolderPlus, Pencil, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing-client";
import { slugify } from "@/lib/utils";
import type { Category, CategoryFormValues } from "./types";

const fieldClass =
  "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function CategoryFormCard({
  editing,
  value,
  onChange,
  parentOptions,
  busy,
  onSubmit,
  onCancel,
  onUploadError,
}: {
  editing: number | null;
  value: CategoryFormValues;
  onChange: (patch: Partial<CategoryFormValues>) => void;
  parentOptions: Category[];
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onUploadError: (message: string) => void;
}) {
  // Tự động render slug khi đặt tên
  function handleNameChange(name: string) {
    const patch: Partial<CategoryFormValues> = { name };
    // Luôn tự động tạo slug khi thêm mới, hoặc khi đang sửa mà slug trùng với slug cũ của tên
    if (!editing || !value.slug || value.slug === slugify(value.name)) {
      patch.slug = slugify(name);
    }
    onChange(patch);
  }

  return (
    <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs transition md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-admin-border pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-10 place-items-center rounded-xl ${
              editing
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                : "bg-admin-accent-soft text-admin-accent"
            }`}
          >
            {editing ? <Pencil size={18} /> : <FolderPlus size={18} />}
          </span>
          <div>
            <h2 className="text-base font-bold text-admin-ink">
              {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <p className="text-xs text-admin-muted">
              {editing
                ? "Đang chỉnh sửa thông tin. Nhấn lưu để áp dụng thay đổi."
                : "Điền thông tin và hình ảnh đại diện để tạo danh mục sản phẩm mới."}
            </p>
          </div>
        </div>

        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-semibold text-admin-muted transition hover:bg-slate-200 hover:text-admin-ink"
          >
            <RotateCcw size={13} />
            Hủy sửa / Tạo mới
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-medium text-admin-ink">
            Tên danh mục <span className="text-rose-500">*</span>
            <input
              required
              placeholder="Ví dụ: Trà Oolong"
              className={`${fieldClass} mt-1.5`}
              value={value.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-admin-ink">
            Slug (Đường dẫn) <span className="text-rose-500">*</span>
            <input
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="tra-oolong"
              className={`${fieldClass} mt-1.5`}
              value={value.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
            />
          </label>

          <label className="block text-sm font-medium text-admin-ink">
            Danh mục cha
            <select
              className={`${fieldClass} mt-1.5`}
              value={value.parentId}
              onChange={(e) => onChange({ parentId: e.target.value })}
            >
              <option value="">Không có (Danh mục gốc)</option>
              {parentOptions
                .filter((option) => option.id !== editing)
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-admin-ink">
            Vị trí sắp xếp
            <input
              type="number"
              min="0"
              placeholder="0"
              className={`${fieldClass} mt-1.5`}
              value={value.position}
              onChange={(e) => onChange({ position: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-1 justify-center">
          <label className="block text-sm font-medium text-admin-ink md:col-span-1">
            Mô tả danh mục
            <textarea
              rows={7}
              placeholder="Mô tả ngắn về danh mục sản phẩm này..."
              className={`${fieldClass} mt-1.5 resize-y`}
              value={value.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </label>

          <div className="rounded-xl border border-admin-border  text-center bg-admin-bg/40 p-3">
            <span className="block text-xs font-semibold text-admin-ink">
              Ảnh danh mục
            </span>
            <div className="mt-2 flex items-center gap-3">
              {value.imageUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={value.imageUrl}
                    alt=""
                    className="size-16 rounded-lg border border-admin-border object-cover shadow-xs"
                  />
                  <button
                    type="button"
                    className="rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    onClick={() =>
                      onChange({ imageUrl: "", imageUploadKey: "" })
                    }
                  >
                    Gỡ ảnh
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <UploadButton
                    endpoint="adminImage"
                    appearance={{
                      button:
                        "bg-admin-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-95 transition ut-uploading:bg-slate-400 ut-ready:bg-admin-accent",
                      allowedContent: "text-[11px] text-admin-muted mt-1",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return "Đang tải...";
                        return ready ? "Tải ảnh lên" : "Đang chuẩn bị...";
                      },
                      allowedContent: "PNG, JPG tối đa 4MB",
                    }}
                    onClientUploadComplete={(files) => {
                      const file = files[0];
                      if (file)
                        onChange({
                          imageUrl: file.url,
                          imageUploadKey: file.key,
                        });
                    }}
                    onUploadError={(error) => onUploadError(error.message)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
          {editing && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink transition hover:bg-admin-bg"
            >
              Hủy
            </button>
          )}
          <button
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-admin-accent px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy
              ? "Đang lưu..."
              : editing
                ? "Cập nhật danh mục"
                : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </section>
  );
}
