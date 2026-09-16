"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    FileCode,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/posts/RichTextEditor";

type PageItem = {
    id: number;
    title: string;
    slug: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

const emptyPage = {
    title: "",
    slug: "",
    content: "",
};

const fieldClass =
    "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function PageManager() {
    const [items, setItems] = useState<PageItem[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [form, setForm] = useState(emptyPage);
    const [busy, setBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PageItem | null>(null);

    const load = useCallback(async () => {
        const res = await fetch("/api/admin/pages").then((r) => r.json());
        setItems(res.data ?? []);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0);
        return () => window.clearTimeout(timer);
    }, [load]);

    function openCreate() {
        setEditing(null);
        setForm(emptyPage);
        setDrawerOpen(true);
    }

    function openEdit(p: PageItem) {
        setEditing(p.id);
        setForm({
            title: p.title,
            slug: p.slug,
            content: p.content,
        });
        setDrawerOpen(true);
    }

    function handleTitleChange(title: string) {
        const next = { ...form, title };
        if (!editing || !form.slug || form.slug === slugify(form.title)) {
            next.slug = slugify(title);
        }
        setForm(next);
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (form.content.replace(/<[^>]*>/g, "").trim().length === 0) {
            toast.error("Vui lòng nhập nội dung trang.");
            return;
        }
        setBusy(true);
        const url = editing ? `/api/admin/pages/${editing}` : "/api/admin/pages";
        const res = await fetch(url, {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const result = await res.json();
        setBusy(false);

        if (!res.ok) {
            toast.error(result.error ?? "Có lỗi xảy ra khi lưu trang.");
            return;
        }

        toast.success(editing ? "Đã cập nhật trang." : "Đã tạo trang mới.");
        setDrawerOpen(false);
        setEditing(null);
        setForm(emptyPage);
        await load();
    }

    async function performDelete() {
        if (!deleteTarget) return;
        const res = await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok) {
            toast.error(result.error ?? "Không thể xóa trang.");
            return;
        }
        toast.success(`Đã xóa trang "${deleteTarget.title}".`);
        setDeleteTarget(null);
        await load();
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Trang nội dung</h1>
                    <p className="text-sm text-admin-muted">Quản lý các trang tĩnh như Giới thiệu, Chính sách, Điều khoản...</p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
                >
                    <Plus size={16} />
                    Tạo trang mới
                </button>
            </header>

            <section className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-admin-border bg-admin-bg/50 text-xs font-semibold uppercase text-admin-muted">
                        <tr>
                            <th className="p-3.5">Tiêu đề trang</th>
                            <th className="p-3.5">Đường dẫn (Slug)</th>
                            <th className="p-3.5">Cập nhật</th>
                            <th className="p-3.5 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-admin-muted">
                                    Chưa có trang nội dung nào.
                                </td>
                            </tr>
                        ) : (
                            items.map((p) => (
                                <tr key={p.id} className="transition hover:bg-admin-bg/40">
                                    <td className="p-3.5 font-semibold text-admin-ink">{p.title}</td>
                                    <td className="p-3.5 font-mono text-xs text-admin-muted">
                                        <a
                                            href={`/pages/${p.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                                        >
                                            /pages/{p.slug} <ExternalLink size={12} />
                                        </a>
                                    </td>
                                    <td className="p-3.5 text-xs text-admin-muted">
                                        {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(p)}
                                                className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-accent"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(p)}
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
            </section>

            {/* Modal Soạn thảo Trang */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-admin-border bg-admin-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                                    <FileCode size={17} />
                                </span>
                                <h2 className="text-base font-bold text-admin-ink">
                                    {editing ? "Chỉnh sửa trang" : "Tạo trang nội dung mới"}
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

                        <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-admin-ink">
                                    Tiêu đề trang <span className="text-rose-500">*</span>
                                    <input
                                        required
                                        placeholder="Ví dụ: Về chúng tôi"
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                    />
                                </label>

                                <label className="block text-sm font-medium text-admin-ink">
                                    Slug (Đường dẫn tự động) <span className="text-rose-500">*</span>
                                    <input
                                        required
                                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                        placeholder="ve-chung-toi"
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="block text-sm font-medium text-admin-ink">
                                Nội dung trang <span className="text-rose-500">*</span>
                                <div className="mt-1.5">
                                    <RichTextEditor
                                        value={form.content}
                                        onChange={(html) => setForm({ ...form, content: html })}
                                        placeholder="Soạn thảo nội dung cho trang..."
                                    />
                                </div>
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
                                    {busy ? "Đang lưu..." : editing ? "Cập nhật trang" : "Tạo trang"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Xóa Trang */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
                        <h3 className="text-base font-bold text-admin-ink">Xác nhận xóa trang?</h3>
                        <p className="mt-1 text-sm text-admin-muted">
                            Bạn có chắc muốn xóa trang <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>?
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
                                Xóa trang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
