"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    Image as ImageIcon,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    X,
    Eye,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing-client";

type Banner = {
    id: number;
    title: string | null;
    subtitle: string | null;
    imageUrl: string;
    imageUploadKey: string | null;
    imageMobileUrl: string | null;
    imageMobileUploadKey: string | null;
    link: string | null;
    buttonText: string | null;
    position: number;
    isActive: boolean;
    createdAt: string;
};

const emptyBanner = {
    title: "",
    subtitle: "",
    imageUrl: "",
    imageUploadKey: "",
    imageMobileUrl: "",
    imageMobileUploadKey: "",
    link: "",
    buttonText: "",
    position: 0,
    isActive: true,
};

const fieldClass =
    "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function BannerManager() {
    const [items, setItems] = useState<Banner[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [form, setForm] = useState(emptyBanner);
    const [busy, setBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

    const load = useCallback(async () => {
        const res = await fetch("/api/admin/banners").then((r) => r.json());
        setItems(res.data ?? []);
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    function openCreate() {
        setEditing(null);
        setForm(emptyBanner);
        setDrawerOpen(true);
    }

    function openEdit(b: Banner) {
        setEditing(b.id);
        setForm({
            title: b.title ?? "",
            subtitle: b.subtitle ?? "",
            imageUrl: b.imageUrl,
            imageUploadKey: b.imageUploadKey ?? "",
            imageMobileUrl: b.imageMobileUrl ?? "",
            imageMobileUploadKey: b.imageMobileUploadKey ?? "",
            link: b.link ?? "",
            buttonText: b.buttonText ?? "",
            position: b.position,
            isActive: b.isActive,
        });
        setDrawerOpen(true);
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (!form.imageUrl) {
            toast.error("Vui lòng tải lên ảnh banner.");
            return;
        }

        setBusy(true);
        const url = editing ? `/api/admin/banners/${editing}` : "/api/admin/banners";
        const res = await fetch(url, {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const result = await res.json();
        setBusy(false);

        if (!res.ok) {
            toast.error(result.error ?? "Có lỗi xảy ra khi lưu banner.");
            return;
        }

        toast.success(editing ? "Đã cập nhật banner." : "Đã thêm banner mới.");
        setDrawerOpen(false);
        setEditing(null);
        setForm(emptyBanner);
        await load();
    }

    async function performDelete() {
        if (!deleteTarget) return;
        const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok) {
            toast.error(result.error ?? "Không thể xóa banner.");
            return;
        }
        toast.success("Đã xóa banner.");
        setDeleteTarget(null);
        await load();
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Quản lý banner</h1>
                    <p className="text-sm text-admin-muted">Quản lý các banner trượt trang chủ và chiến dịch khuyến mãi.</p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
                >
                    <Plus size={16} />
                    Thêm banner mới
                </button>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                {items.length === 0 ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-admin-border p-12 text-center text-admin-muted">
                        <ImageIcon size={32} className="mx-auto mb-2 text-admin-muted/60" />
                        Chưa có banner nào. Hãy bấm &ldquo;Thêm banner mới&rdquo; để tải ảnh lên.
                    </div>
                ) : (
                    items.map((b) => (
                        <article
                            key={b.id}
                            className="group overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-xs transition hover:shadow-md"
                        >
                            <div className="relative aspect-21/9 w-full overflow-hidden bg-slate-900">
                                <img
                                    src={b.imageUrl}
                                    alt={b.title ?? ""}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4 text-white">
                                    {b.title && <h3 className="font-bold text-sm drop-shadow-sm">{b.title}</h3>}
                                    {b.subtitle && <p className="text-xs text-slate-200 line-clamp-1">{b.subtitle}</p>}
                                </div>
                                <span className="absolute top-2.5 left-2.5 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                                    Vị trí: {b.position}
                                </span>
                                <span
                                    className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        b.isActive
                                            ? "bg-emerald-500/90 text-white"
                                            : "bg-slate-500/80 text-white"
                                    }`}
                                >
                                    {b.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                                    {b.isActive ? "Hiển thị" : "Tạm ẩn"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5">
                                <div className="text-xs text-admin-muted">
                                    {b.link ? (
                                        <span className="flex items-center gap-1 text-admin-accent hover:underline">
                                            <ExternalLink size={12} /> {b.link}
                                        </span>
                                    ) : (
                                        "Không có liên kết"
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(b)}
                                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-accent"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(b)}
                                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Modal Thêm/Sửa Banner */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border border-admin-border bg-admin-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                                    <ImageIcon size={17} />
                                </span>
                                <h2 className="text-base font-bold text-admin-ink">
                                    {editing ? "Chỉnh sửa banner" : "Thêm banner mới"}
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
                            <div className="rounded-xl border border-admin-border bg-admin-bg/30 p-3">
                                <span className="block text-xs font-semibold text-admin-ink">
                                    Ảnh Banner Desktop <span className="text-rose-500">*</span>
                                </span>
                                <div className="mt-2">
                                    {form.imageUrl ? (
                                        <div className="space-y-2">
                                            <img
                                                src={form.imageUrl}
                                                alt=""
                                                className="aspect-21/9 w-full rounded-lg border border-admin-border object-cover"
                                            />
                                            <button
                                                type="button"
                                                className="text-xs font-semibold text-rose-600 hover:underline"
                                                onClick={() => setForm({ ...form, imageUrl: "", imageUploadKey: "" })}
                                            >
                                                Gỡ ảnh
                                            </button>
                                        </div>
                                    ) : (
                                        <UploadButton
                                            endpoint="adminImage"
                                            appearance={{
                                                button: "bg-admin-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-95 transition",
                                                allowedContent: "text-[11px] text-admin-muted mt-1",
                                            }}
                                            content={{
                                                button({ ready, isUploading }) {
                                                    if (isUploading) return "Đang tải...";
                                                    return ready ? "Tải ảnh banner lên" : "Đang chuẩn bị...";
                                                },
                                                allowedContent: "Khuyên dùng kích thước 1920x600px",
                                            }}
                                            onClientUploadComplete={(files) => {
                                                const file = files[0];
                                                if (file) setForm({ ...form, imageUrl: file.url, imageUploadKey: file.key });
                                            }}
                                            onUploadError={(err) => {
                                                toast.error(err.message);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-admin-ink">
                                    Tiêu đề banner
                                    <input
                                        placeholder="Ví dụ: Trà Ngon Cầu Đất"
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </label>

                                <label className="block text-sm font-medium text-admin-ink">
                                    Vị trí thứ tự
                                    <input
                                        type="number"
                                        min={0}
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                                    />
                                </label>
                            </div>

                            <label className="block text-sm font-medium text-admin-ink">
                                Phụ đề / Mô tả ngắn
                                <input
                                    placeholder="Ví dụ: Giảm giá 20% các dòng trà mộc thượng hạng"
                                    className={`${fieldClass} mt-1.5`}
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                />
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-admin-ink">
                                    Liên kết (Link khi click)
                                    <input
                                        placeholder="Ví dụ: /san-pham/tra-oolong"
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.link}
                                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                                    />
                                </label>

                                <label className="block text-sm font-medium text-admin-ink">
                                    Chữ trên nút (Button Text)
                                    <input
                                        placeholder="Ví dụ: Khám phá ngay"
                                        className={`${fieldClass} mt-1.5`}
                                        value={form.buttonText}
                                        onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 pt-2 text-sm font-medium text-admin-ink">
                                <input
                                    type="checkbox"
                                    className="size-4 rounded accent-admin-accent"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                />
                                Kích hoạt hiển thị banner này
                            </label>

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
                                    {busy ? "Đang lưu..." : editing ? "Cập nhật banner" : "Thêm banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Xóa Banner */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
                        <h3 className="text-base font-bold text-admin-ink">Xác nhận xóa banner?</h3>
                        <p className="mt-1 text-sm text-admin-muted">Hành động này sẽ gỡ bỏ banner vĩnh viễn khỏi trang chủ.</p>
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
                                Xóa banner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
