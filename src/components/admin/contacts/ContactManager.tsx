"use client";

import { useCallback, useEffect, useState } from "react";
import {
    MessageSquare,
    Search,
    Mail,
    Phone,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Contact = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    createdAt: string;
};

type ContactMeta = { page: number; pageSize: number; total: number; pageCount: number };

const fieldClass =
    "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function ContactManager() {
    const [items, setItems] = useState<Contact[]>([]);
    const [meta, setMeta] = useState<ContactMeta>({ page: 1, pageSize: 10, total: 0, pageCount: 1 });
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

    const load = useCallback(
        async (page = 1) => {
            const res = await fetch(
                `/api/admin/contacts?page=${page}&search=${encodeURIComponent(search)}&sort=createdAt&direction=desc`,
            ).then((r) => r.json());
            setItems(res.data ?? []);
            setMeta(res.pagination ?? meta);
        },
        [search],
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function performDelete() {
        if (!deleteTarget) return;
        const res = await fetch(`/api/admin/contacts/${deleteTarget.id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok) {
            toast.error(result.error ?? "Không thể xóa tin nhắn.");
            return;
        }
        toast.success("Đã xóa tin nhắn liên hệ.");
        setDeleteTarget(null);
        await load(Math.min(meta.page, meta.pageCount));
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Tin nhắn & Liên hệ</h1>
                    <p className="text-sm text-admin-muted">Danh sách câu hỏi, phản hồi từ khách hàng gửi qua form liên hệ.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted shadow-xs">
                    Tổng số: <span className="text-sm font-bold text-admin-ink">{meta.total}</span> tin nhắn
                </div>
            </header>

            <section className="rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
                <div className="border-b border-admin-border p-4">
                    <div className="relative max-w-sm">
                        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
                        <input
                            className={`${fieldClass} pl-9`}
                            placeholder="Tìm tên, email, số điện thoại, nội dung..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-admin-border">
                    {items.length === 0 ? (
                        <div className="p-12 text-center text-admin-muted">
                            <MessageSquare size={32} className="mx-auto mb-2 text-admin-muted/60" />
                            Không có tin nhắn liên hệ nào.
                        </div>
                    ) : (
                        items.map((msg) => (
                            <article key={msg.id} className="p-5 transition hover:bg-admin-bg/30">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 font-bold text-amber-800">
                                            {msg.name ? msg.name.charAt(0).toUpperCase() : "K"}
                                        </div>
                                        <div>
                                            <strong className="block font-semibold text-admin-ink">{msg.name}</strong>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-admin-muted">
                                                <a
                                                    href={`mailto:${msg.email}`}
                                                    className="flex items-center gap-1 hover:text-admin-accent hover:underline"
                                                >
                                                    <Mail size={12} /> {msg.email}
                                                </a>
                                                {msg.phone && (
                                                    <a
                                                        href={`tel:${msg.phone}`}
                                                        className="flex items-center gap-1 hover:text-admin-accent hover:underline"
                                                    >
                                                        <Phone size={12} /> {msg.phone}
                                                    </a>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(msg.createdAt).toLocaleString("vi-VN")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        title="Xóa tin nhắn"
                                        onClick={() => setDeleteTarget(msg)}
                                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <div className="mt-3.5 rounded-xl border border-admin-border bg-admin-bg/40 p-4 text-sm text-admin-ink whitespace-pre-wrap leading-relaxed">
                                    {msg.message}
                                </div>
                            </article>
                        ))
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border p-4 text-xs text-admin-muted">
                    <span>
                        Hiển thị <strong>{items.length}</strong> / <strong>{meta.total}</strong> tin nhắn
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

            {/* Confirm Xóa Tin nhắn */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
                        <h3 className="text-base font-bold text-admin-ink">Xác nhận xóa tin nhắn?</h3>
                        <p className="mt-1 text-sm text-admin-muted">
                            Bạn có chắc muốn xóa tin nhắn từ <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>?
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
                                Xóa tin nhắn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
