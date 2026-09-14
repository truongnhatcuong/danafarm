"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  Loader2,
  X,
  ImageOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/posts/RichTextEditor";
import { UploadButton } from "@/lib/uploadthing-client";
import { slugify } from "@/lib/utils";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  author: string | null;
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
};

type PostMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImageUploadKey: "",
  author: "DanaFarm",
  isFeatured: false,
};

const fieldClass =
  "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function PostManager() {
  const [items, setItems] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PostMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("publishedAt");
  const [direction, setDirection] = useState("desc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const load = useCallback(
    async (page = 1) => {
      const res = await fetch(
        `/api/admin/posts?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`,
      ).then((r) => r.json());
      setItems(res.data ?? []);
      setMeta(res.pagination ?? meta);
    },
    [search, sort, direction],
  );

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyPost);
    setDrawerOpen(true);
  }

  function openEdit(post: Post) {
    setEditing(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      coverImageUploadKey: "",
      author: post.author ?? "DanaFarm",
      isFeatured: post.isFeatured,
    });
    setDrawerOpen(true);
  }

  function handleTitleChange(title: string) {
    const next: typeof form = { ...form, title };
    if (!editing || !form.slug || form.slug === slugify(form.title)) {
      next.slug = slugify(title);
    }
    setForm(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const plainContent = form.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!plainContent) {
      toast.error("Vui lòng nhập nội dung bài viết.");
      return;
    }
    setBusy(true);
    const url = editing ? `/api/admin/posts/${editing}` : "/api/admin/posts";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImageUrl: form.coverImageUrl || null,
        coverImageUploadKey: form.coverImageUploadKey || null,
        excerpt: form.excerpt || null,
      }),
    });
    const result = await res.json();
    setBusy(false);

    if (!res.ok) {
      toast.error(result.error ?? "Có lỗi xảy ra khi lưu bài viết.");
      return;
    }

    toast.success(editing ? "Đã cập nhật bài viết." : "Đã thêm bài viết mới.");
    setDrawerOpen(false);
    setEditing(null);
    setForm(emptyPost);
    await load();
  }

  async function performDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/posts/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error ?? "Không thể xóa bài viết.");
      return;
    }
    toast.success(`Đã xóa bài viết "${deleteTarget.title}".`);
    setDeleteTarget(null);
    await load(Math.min(meta.page, meta.pageCount));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-admin-ink">
            Quản lý bài viết
          </h1>
          <p className="text-sm text-admin-muted">
            Đăng tin tức, cẩm nang trà, cà phê và thông báo.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
        >
          <Plus size={16} />
          Viết bài mới
        </button>
      </header>

      <section className="rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border p-4">
          <div className="relative max-w-sm flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
            />
            <input
              className={`${fieldClass} pl-9`}
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className={`${fieldClass} w-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="publishedAt">Ngày đăng</option>
              <option value="createdAt">Ngày tạo</option>
              <option value="title">Tiêu đề</option>
            </select>
            <select
              className={`${fieldClass} w-auto`}
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg/50 text-xs font-semibold uppercase text-admin-muted">
              <tr>
                <th className="p-3.5">Bài viết</th>
                <th className="p-3.5">Tác giả</th>
                <th className="p-3.5">Nổi bật</th>
                <th className="p-3.5">Ngày đăng</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-admin-muted">
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              ) : (
                items.map((post) => (
                  <tr key={post.id} className="transition hover:bg-admin-bg/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {post.coverImageUrl ? (
                          <img
                            src={post.coverImageUrl}
                            alt=""
                            className="size-12 rounded-lg border border-admin-border object-cover"
                          />
                        ) : (
                          <div className="grid size-12 place-items-center rounded-lg border border-admin-border bg-admin-bg text-admin-muted">
                            <ImageOff size={16} />
                          </div>
                        )}
                        <div>
                          <strong className="block font-semibold text-admin-ink">
                            {post.title}
                          </strong>
                          <span className="font-mono text-xs text-admin-muted">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-admin-muted">
                      {post.author || "DanaFarm"}
                    </td>
                    <td className="p-3.5">
                      {post.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
                          <Star size={10} className="fill-amber-600" /> Nổi bật
                        </span>
                      ) : (
                        <span className="text-xs text-admin-muted">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-admin-muted">
                      {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => openEdit(post)}
                          className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-accent"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title="Xóa bài viết"
                          onClick={() => setDeleteTarget(post)}
                          className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border p-4 text-xs text-admin-muted">
          <span>
            Hiển thị <strong>{items.length}</strong> /{" "}
            <strong>{meta.total}</strong> bài viết
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => load(meta.page - 1)}
              className="flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-1 font-medium transition hover:bg-admin-bg disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Trước
            </button>
            <span>
              Trang {meta.page} / {meta.pageCount}
            </span>
            <button
              disabled={meta.page >= meta.pageCount}
              onClick={() => load(meta.page + 1)}
              className="flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-1 font-medium transition hover:bg-admin-bg disabled:opacity-40"
            >
              Sau <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Modal / Drawer Soạn thảo bài viết */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col rounded-2xl border border-admin-border bg-admin-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                  <FileText size={17} />
                </span>
                <h2 className="text-base font-bold text-admin-ink">
                  {editing ? "Chỉnh sửa bài viết" : "Viết bài mới"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-admin-muted hover:bg-admin-bg"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="flex-1 space-y-4 overflow-y-auto p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-admin-ink">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                  <input
                    required
                    placeholder="Ví dụ: Bí quyết pha trà Oolong thơm đượm vị"
                    className={`${fieldClass} mt-1.5`}
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </label>

                <label className="block text-sm font-medium text-admin-ink">
                  Slug (Đường dẫn tự động){" "}
                  <span className="text-rose-500">*</span>
                  <input
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    className={`${fieldClass} mt-1.5`}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </label>

                <label className="block text-sm font-medium text-admin-ink">
                  Tác giả
                  <input
                    className={`${fieldClass} mt-1.5`}
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                  />
                </label>

                <div className="flex items-center pt-6">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-admin-ink">
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-admin-accent"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm({ ...form, isFeatured: e.target.checked })
                      }
                    />
                    Ghim bài viết nổi bật
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-admin-border bg-admin-bg/30 p-3">
                <span className="block text-xs font-semibold text-admin-ink">
                  Ảnh bìa bài viết
                </span>
                <div className="mt-2 flex items-center gap-3">
                  {form.coverImageUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={form.coverImageUrl}
                        alt=""
                        className="h-16 w-24 rounded-lg border border-admin-border object-cover"
                      />
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:underline"
                        onClick={() =>
                          setForm({
                            ...form,
                            coverImageUrl: "",
                            coverImageUploadKey: "",
                          })
                        }
                      >
                        Gỡ ảnh
                      </button>
                    </div>
                  ) : (
                    <UploadButton
                      endpoint="adminImage"
                      appearance={{
                        button:
                          "bg-admin-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-95 transition",
                        allowedContent: "text-[11px] text-admin-muted mt-1",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) return "Đang tải...";
                          return ready ? "Chọn ảnh bìa" : "Đang chuẩn bị...";
                        },
                        allowedContent: "PNG, JPG tối đa 4MB",
                      }}
                      onClientUploadComplete={(files) => {
                        const file = files[0];
                        if (file)
                          setForm({
                            ...form,
                            coverImageUrl: file.url,
                            coverImageUploadKey: file.key,
                          });
                      }}
                      onUploadError={(err) => {
                        toast.error(err.message);
                      }}
                    />
                  )}
                </div>
              </div>

              <label className="block text-sm font-medium text-admin-ink">
                Tóm tắt ngắn
                <textarea
                  rows={2}
                  placeholder="Tóm tắt 1-2 câu xuất hiện ở danh sách bài viết..."
                  className={`${fieldClass} mt-1.5`}
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                />
              </label>

              <div className="block text-sm font-medium text-admin-ink">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span>
                    Nội dung bài viết <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs font-normal text-admin-muted">
                    Soạn thảo trực quan
                  </span>
                </div>
                <RichTextEditor
                  value={form.content}
                  onChange={(content) =>
                    setForm((current) => ({ ...current, content }))
                  }
                  placeholder="Bắt đầu viết nội dung bài viết tại đây..."
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-admin-border pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg"
                >
                  Hủy
                </button>
                <button
                  disabled={busy}
                  className="flex items-center gap-2 rounded-lg bg-admin-accent px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
                >
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  {busy
                    ? "Đang lưu..."
                    : editing
                      ? "Cập nhật bài viết"
                      : "Đăng bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Xóa bài viết */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
            <h3 className="text-base font-bold text-admin-ink">
              Xác nhận xóa bài viết?
            </h3>
            <p className="mt-1 text-sm text-admin-muted">
              Bạn có chắc muốn xóa{" "}
              <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>? Hành động này
              không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-rose-700"
              >
                Xóa bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
