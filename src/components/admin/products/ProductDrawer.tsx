"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { generateSku, generateVariantSku, slugify } from "@/lib/utils";
import {
  groupCategoriesByParent,
  type Category,
  type ProductFormValues,
} from "./types";

const fieldClass =
  "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";
const labelClass = "block text-sm font-medium text-admin-ink";

const tabs = [
  { id: "basic", label: "Cơ bản" },
  { id: "pricing", label: "Giá & Kho" },
  { id: "images", label: "Hình ảnh" },
  { id: "variants", label: "Biến thể" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDrawer({
  open,
  editing,
  value,
  onChange,
  categories,
  busy,
  onSubmit,
  onClose,
  onUploadError,
}: {
  open: boolean;
  editing: number | null;
  value: ProductFormValues;
  onChange: (patch: Partial<ProductFormValues>) => void;
  categories: Category[];
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onUploadError: (message: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("basic");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function set<K extends keyof ProductFormValues>(
    key: K,
    val: ProductFormValues[K],
  ) {
    onChange({ [key]: val } as Partial<ProductFormValues>);
  }

  function makeMainImage(index: number) {
    const reordered = [
      value.images[index],
      ...value.images.filter((_, i) => i !== index),
    ].map((img, i) => ({ ...img, position: i }));
    set("images", reordered);
  }

  function removeImage(index: number) {
    set(
      "images",
      value.images
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, position: i })),
    );
  }

  function handleNameChange(name: string) {
    const patch: Partial<ProductFormValues> = { name };
    // 1. Tự động render slug từ tên
    if (!editing || !value.slug || value.slug === slugify(value.name)) {
      patch.slug = slugify(name);
    }
    // 2. Tự động gen SKU theo nguyên tắc chuẩn DanaFarm chống trùng
    if (!editing && (!value.sku || value.sku.startsWith("DNF-"))) {
      patch.sku = generateSku(name);
    }
    onChange(patch);
  }

  function regenerateSku() {
    onChange({ sku: generateSku(value.name || "Sản phẩm") });
  }

  function toggleCategory(id: number, checked: boolean) {
    set(
      "categoryIds",
      checked
        ? [...value.categoryIds, id]
        : value.categoryIds.filter((existingId) => existingId !== id),
    );
  }

  function renderCategoryChip(c: Category) {
    const checked = value.categoryIds.includes(c.id);
    return (
      <label
        key={c.id}
        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition ${checked
            ? "border-admin-accent bg-admin-accent-soft text-admin-accent"
            : "border-admin-border text-admin-ink hover:bg-admin-bg"
          }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => toggleCategory(c.id, e.target.checked)}
        />
        {c.name}
      </label>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-admin-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-admin-ink">
              {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <p className="text-xs text-admin-muted">
              {editing
                ? "Cập nhật thông tin sản phẩm hiện có."
                : "Điền thông tin để tạo sản phẩm mới."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-admin-border px-5 pt-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-t-lg px-3.5 py-2 text-sm font-semibold transition ${tab === t.id
                  ? "border-b-2 border-admin-accent text-admin-accent"
                  : "border-b-2 border-transparent text-admin-muted hover:text-admin-ink"
                }`}
            >
              {t.label}
              {t.id === "images" && value.images.length > 0 && (
                <span className="ml-1.5 text-xs text-admin-muted">
                  ({value.images.length})
                </span>
              )}
              {t.id === "variants" && value.variants.length > 0 && (
                <span className="ml-1.5 text-xs text-admin-muted">
                  ({value.variants.length})
                </span>
              )}
            </button>
          ))}
        </div>

        <form
          id="product-drawer-form"
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto px-5 py-5"
        >
          {tab === "basic" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Tên sản phẩm <span className="text-rose-500">*</span>
                  <input
                    required
                    placeholder="Ví dụ: Trà Oolong Cầu Đất"
                    className={`${fieldClass} mt-1.5`}
                    value={value.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Slug <span className="text-rose-500">*</span>
                  <input
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    placeholder="tra-oolong-cau-dat"
                    className={`${fieldClass} mt-1.5`}
                    value={value.slug}
                    onChange={(e) => set("slug", e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  <div className="flex items-center justify-between">
                    <span>SKU (Mã quản lý kho)</span>
                    <button
                      type="button"
                      onClick={regenerateSku}
                      title="Sinh lại mã ngẫu nhiên theo tên chuẩn chống trùng"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-admin-accent hover:underline"
                    >
                      <Sparkles size={11} />
                      Tự động gen mã
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      className={`${fieldClass} pr-8 font-mono uppercase tracking-wider`}
                      placeholder="DNF-TOCD-7K9A"
                      value={value.sku}
                      onChange={(e) => set("sku", e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={regenerateSku}
                      title="Đổi mã SKU ngẫu nhiên khác"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-muted transition hover:text-admin-accent"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </label>
                <label className={labelClass}>
                  Đơn vị
                  <input
                    className={`${fieldClass} mt-1.5`}
                    placeholder="Hộp, kg, gói..."
                    value={value.unitLabel}
                    onChange={(e) => set("unitLabel", e.target.value)}
                  />
                </label>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-bold text-admin-ink">
                  Danh mục
                </legend>
                {categories.length === 0 ? (
                  <p className="text-sm text-admin-muted">
                    Chưa có danh mục nào.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupCategoriesByParent(categories).map(
                      ({ root, children }) => (
                        <div key={root.id}>
                          {renderCategoryChip(root)}
                          {children.length > 0 && (
                            <div className="mt-2 ml-4 flex flex-wrap gap-2 border-l-2 border-admin-border pl-3">
                              {children.map((child) =>
                                renderCategoryChip(child),
                              )}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-bold text-admin-ink">
                  Nhãn
                </legend>
                <div className="flex flex-wrap gap-4">
                  {(
                    [
                      ["isFeatured", "Nổi bật"],
                      ["isOnSale", "Khuyến mãi"],
                      ["isBestSeller", "Bán chạy"],
                      ["isNew", "Mới"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-admin-ink"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-admin-accent"
                        checked={value[key]}
                        onChange={(e) => set(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Mô tả ngắn
                  <textarea
                    className={`${fieldClass} mt-1.5 min-h-20 resize-y`}
                    value={value.shortDescription}
                    onChange={(e) => set("shortDescription", e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Mô tả đầy đủ
                  <textarea
                    className={`${fieldClass} mt-1.5 min-h-20 resize-y`}
                    value={value.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Hướng dẫn sử dụng
                  <textarea
                    className={`${fieldClass} mt-1.5 min-h-20 resize-y`}
                    value={value.usageGuide}
                    onChange={(e) => set("usageGuide", e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Hướng dẫn bảo quản
                  <textarea
                    className={`${fieldClass} mt-1.5 min-h-20 resize-y`}
                    value={value.preservationGuide}
                    onChange={(e) => set("preservationGuide", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {tab === "pricing" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Giá bán <span className="text-rose-500">*</span>
                  <input
                    required
                    type="number"
                    min={0}
                    className={`${fieldClass} mt-1.5`}
                    value={value.price}
                    onChange={(e) => set("price", Number(e.target.value))}
                  />
                </label>
                <label className={labelClass}>
                  Giá so sánh (gạch ngang)
                  <input
                    type="number"
                    min={0}
                    className={`${fieldClass} mt-1.5`}
                    value={value.compareAtPrice}
                    onChange={(e) => set("compareAtPrice", e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Số lượng tồn kho
                  <input
                    type="number"
                    min={0}
                    className={`${fieldClass} mt-1.5`}
                    value={value.quantity}
                    onChange={(e) =>
                      set(
                        "quantity",
                        Math.max(0, parseInt(e.target.value, 10) || 0),
                      )
                    }
                    placeholder="0"
                  />
                  <span className="mt-1 block text-[11px] font-normal text-admin-muted">
                    {value.quantity > 0
                      ? `Còn hàng (${value.quantity} sản phẩm)`
                      : "Hết hàng (0 sản phẩm)"}
                  </span>
                </label>
                <label className={labelClass}>
                  Trạng thái hiển thị
                  <select
                    className={`${fieldClass} mt-1.5`}
                    value={value.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="active">Hiển thị</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {tab === "images" && (
            <div className="space-y-4">
              {value.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {value.images.map((image, i) => (
                    <div
                      key={`${image.url}-${i}`}
                      className="group relative overflow-hidden rounded-xl border border-admin-border bg-admin-bg/40 p-2 shadow-xs transition"
                    >
                      <div className="relative">
                        <Image
                          src={image.url}
                          alt={image.alt ?? ""}
                          width={400}
                          height={400}
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                        {i === 0 ? (
                          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-admin-accent px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                            <Star size={10} className="fill-white" />
                            Ảnh chính
                          </span>
                        ) : (
                          <button
                            type="button"
                            title="Đặt làm ảnh chính"
                            onClick={() => makeMainImage(i)}
                            className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/70"
                          >
                            <Star size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Xóa ảnh"
                          onClick={() => removeImage(i)}
                          className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <input
                        className="mt-1.5 w-full rounded-lg border border-admin-border bg-admin-surface px-2 py-1 text-xs text-admin-ink outline-none focus:border-admin-accent"
                        placeholder="Mô tả ảnh (Alt)"
                        value={image.alt ?? ""}
                        onChange={(e) =>
                          set(
                            "images",
                            value.images.map((x, j) =>
                              j === i ? { ...x, alt: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-admin-border bg-admin-bg/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-admin-ink">
                  <ImagePlus size={15} />
                  Tải ảnh sản phẩm
                </div>
                <UploadDropzone
                  endpoint="adminImage"
                  appearance={{
                    container:
                      "border-2 border-dashed border-admin-border rounded-xl py-6 px-4 bg-admin-surface hover:border-admin-accent hover:bg-admin-accent-soft/30 transition cursor-pointer flex flex-col items-center justify-center",
                    uploadIcon: "w-8 h-8 text-admin-muted mb-1",
                    label: "text-xs font-semibold text-admin-ink",
                    allowedContent: "text-[11px] text-admin-muted mt-0.5",
                    button:
                      "mt-2 bg-admin-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-95 transition ut-uploading:bg-slate-400",
                  }}
                  content={{
                    label: "Kéo thả ảnh vào đây hoặc bấm để chọn",
                    allowedContent: "PNG, JPG, WebP tối đa 4MB (tối đa 10 ảnh)",
                    button({ ready, isUploading }) {
                      if (isUploading) return "Đang tải...";
                      return ready ? "Chọn tệp tải lên" : "Đang chuẩn bị...";
                    },
                  }}
                  onClientUploadComplete={(files) =>
                    set("images", [
                      ...value.images,
                      ...files.map((f, i) => ({
                        url: f.url,
                        uploadKey: f.key,
                        alt: value.name,
                        position: value.images.length + i,
                      })),
                    ])
                  }
                  onUploadError={(e) => onUploadError(e.message)}
                />
              </div>
            </div>
          )}

          {tab === "variants" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-admin-muted">
                  Thêm các biến thể như dung tích, khối lượng, gói combo...
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = value.variants.length + 1;
                    const nextSku = generateVariantSku(
                      value.sku,
                      "",
                      nextIndex,
                    );
                    set("variants", [
                      ...value.variants,
                      {
                        name: "",
                        price: value.price,
                        compareAtPrice: null,
                        sku: nextSku,
                        position: value.variants.length,
                      },
                    ]);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-sm font-semibold text-admin-accent transition hover:bg-admin-accent-soft"
                >
                  <Plus size={14} />
                  Thêm biến thể
                </button>
              </div>

              {value.variants.length === 0 && (
                <p className="rounded-xl border border-dashed border-admin-border p-6 text-center text-sm text-admin-muted">
                  Chưa có biến thể nào.
                </p>
              )}

              {value.variants.map((v, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-admin-border bg-admin-bg/30 p-3"
                >
                  <GripVertical
                    size={16}
                    className="mt-2.5 shrink-0 text-admin-muted"
                  />
                  <div className="grid flex-1 gap-2 sm:grid-cols-4">
                    <input
                      required
                      className={fieldClass}
                      placeholder="Tên biến thể"
                      value={v.name}
                      onChange={(e) =>
                        set(
                          "variants",
                          value.variants.map((x, j) =>
                            j === i ? { ...x, name: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <input
                      required
                      type="number"
                      min={0}
                      className={fieldClass}
                      placeholder="Giá"
                      value={v.price}
                      onChange={(e) =>
                        set(
                          "variants",
                          value.variants.map((x, j) =>
                            j === i
                              ? { ...x, price: Number(e.target.value) }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      placeholder="Giá so sánh"
                      value={v.compareAtPrice ?? ""}
                      onChange={(e) =>
                        set(
                          "variants",
                          value.variants.map((x, j) =>
                            j === i
                              ? {
                                ...x,
                                compareAtPrice:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      className={fieldClass}
                      placeholder="SKU"
                      value={v.sku ?? ""}
                      onChange={(e) =>
                        set(
                          "variants",
                          value.variants.map((x, j) =>
                            j === i ? { ...x, sku: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Xóa biến thể"
                    onClick={() =>
                      set(
                        "variants",
                        value.variants
                          .filter((_, j) => j !== i)
                          .map((x, j) => ({ ...x, position: j })),
                      )
                    }
                    className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-2.5 border-t border-admin-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink transition hover:bg-admin-bg"
          >
            Hủy
          </button>
          <button
            form="product-drawer-form"
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-admin-accent px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy
              ? "Đang lưu..."
              : editing
                ? "Cập nhật sản phẩm"
                : "Thêm sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
