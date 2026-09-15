"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
    CalendarClock,
    Eye,
    EyeOff,
    Loader2,
    Pencil,
    Plus,
    TicketPercent,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { getVoucherImagePath } from "@/lib/vouchers";

type Voucher = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    discountType: "FIXED_AMOUNT" | "PERCENTAGE" | "FREE_SHIPPING";
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
    showOnHomepage: boolean;
    position: number;
    _count: { usages: number; orders: number };
};

type VoucherForm = {
    code: string;
    title: string;
    description: string;
    discountType: "FIXED_AMOUNT" | "PERCENTAGE" | "FREE_SHIPPING";
    discountValue: string;
    minOrderValue: string;
    maxDiscount: string;
    usageLimit: string;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
    showOnHomepage: boolean;
    position: string;
};

function toLocalInput(date: Date) {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createEmptyForm(): VoucherForm {
    const startsAt = new Date();
    startsAt.setSeconds(0, 0);
    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    return {
        code: "",
        title: "",
        description: "",
        discountType: "FIXED_AMOUNT",
        discountValue: "10000",
        minOrderValue: "350000",
        maxDiscount: "",
        usageLimit: "100",
        startsAt: toLocalInput(startsAt),
        expiresAt: toLocalInput(expiresAt),
        isActive: true,
        showOnHomepage: true,
        position: "0",
    };
}

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2.5 text-sm text-admin-ink outline-none transition focus:border-admin-accent";

function getStatus(voucher: Voucher) {
    const now = Date.now();
    if (!voucher.isActive) return { label: "Tạm ngưng", className: "bg-slate-100 text-slate-600" };
    if (new Date(voucher.startsAt).getTime() > now) return { label: "Sắp diễn ra", className: "bg-blue-50 text-blue-700" };
    if (new Date(voucher.expiresAt).getTime() < now) return { label: "Hết hạn", className: "bg-rose-50 text-rose-700" };
    if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
        return { label: "Hết lượt", className: "bg-amber-50 text-amber-700" };
    }
    return { label: "Đang hoạt động", className: "bg-emerald-50 text-emerald-700" };
}

function benefitLabel(voucher: Voucher) {
    if (voucher.discountType === "FREE_SHIPPING") {
        return voucher.discountValue > 0
            ? `Giảm tối đa ${formatCurrency(voucher.discountValue)} phí vận chuyển`
            : "Miễn phí vận chuyển";
    }
    if (voucher.discountType === "PERCENTAGE") {
        return `Giảm ${voucher.discountValue}%${voucher.maxDiscount ? ` · tối đa ${formatCurrency(voucher.maxDiscount)}` : ""}`;
    }
    return `Giảm ${formatCurrency(voucher.discountValue)}`;
}

function VoucherTypeIcon({ type }: { type: Voucher["discountType"] }) {
    return <Image src={getVoucherImagePath(type)} alt="" width={36} height={36} className="size-9 object-contain" />;
}

export function VoucherManager() {
    const [items, setItems] = useState<Voucher[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<VoucherForm>(createEmptyForm);
    const [busy, setBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

    const load = useCallback(async () => {
        const response = await fetch("/api/admin/vouchers");
        const body = await response.json();
        if (!response.ok) {
            toast.error(body.error ?? "Không thể tải danh sách voucher.");
            return;
        }
        setItems(body.data ?? []);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    function openCreate() {
        setEditingId(null);
        setForm(createEmptyForm());
        setModalOpen(true);
    }

    function openEdit(voucher: Voucher) {
        setEditingId(voucher.id);
        setForm({
            code: voucher.code,
            title: voucher.title,
            description: voucher.description ?? "",
            discountType: voucher.discountType,
            discountValue: String(voucher.discountValue),
            minOrderValue: String(voucher.minOrderValue),
            maxDiscount: voucher.maxDiscount == null ? "" : String(voucher.maxDiscount),
            usageLimit: voucher.usageLimit == null ? "" : String(voucher.usageLimit),
            startsAt: toLocalInput(new Date(voucher.startsAt)),
            expiresAt: toLocalInput(new Date(voucher.expiresAt)),
            isActive: voucher.isActive,
            showOnHomepage: voucher.showOnHomepage,
            position: String(voucher.position),
        });
        setModalOpen(true);
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        try {
            const url = editingId ? `/api/admin/vouchers/${editingId}` : "/api/admin/vouchers";
            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: form.code,
                    title: form.title,
                    description: form.description || null,
                    discountType: form.discountType,
                    discountValue: Number(form.discountValue),
                    minOrderValue: Number(form.minOrderValue || 0),
                    maxDiscount:
                        form.discountType === "PERCENTAGE" && form.maxDiscount
                            ? Number(form.maxDiscount)
                            : null,
                    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                    startsAt: new Date(form.startsAt).toISOString(),
                    expiresAt: new Date(form.expiresAt).toISOString(),
                    isActive: form.isActive,
                    showOnHomepage: form.showOnHomepage,
                    position: Number(form.position || 0),
                }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error ?? "Không thể lưu voucher.");

            toast.success(editingId ? "Đã cập nhật voucher." : "Đã tạo voucher mới.");
            setModalOpen(false);
            await load();
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setBusy(false);
        }
    }

    async function performDelete() {
        if (!deleteTarget) return;
        setBusy(true);
        try {
            const response = await fetch(`/api/admin/vouchers/${deleteTarget.id}`, { method: "DELETE" });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error ?? "Không thể xóa voucher.");
            toast.success(body.deactivated ? "Voucher đã có lịch sử sử dụng nên được chuyển sang tạm ngưng." : "Đã xóa voucher.");
            setDeleteTarget(null);
            await load();
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Quản lý voucher</h1>
                    <p className="text-sm text-admin-muted">Tạo mã giảm giá áp dụng cho toàn bộ sản phẩm và theo dõi lượt sử dụng.</p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
                >
                    <Plus size={16} /> Thêm voucher
                </button>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-admin-surface p-4 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-admin-muted">Tổng voucher</p>
                    <strong className="mt-1 block text-2xl text-admin-ink">{items.length}</strong>
                </div>
                <div className="rounded-xl border border-admin-border bg-admin-surface p-4 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-admin-muted">Đang hoạt động</p>
                    <strong className="mt-1 block text-2xl text-emerald-600">
                        {items.filter((item) => getStatus(item).label === "Đang hoạt động").length}
                    </strong>
                </div>
                <div className="rounded-xl border border-admin-border bg-admin-surface p-4 shadow-xs">
                    <p className="text-xs font-semibold uppercase text-admin-muted">Tổng lượt đã dùng</p>
                    <strong className="mt-1 block text-2xl text-admin-accent">
                        {items.reduce((total, item) => total + item.usedCount, 0)}
                    </strong>
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-admin-border bg-admin-bg/35 text-left text-xs font-semibold uppercase text-admin-muted">
                                <th className="px-4 py-3">Voucher</th>
                                <th className="px-4 py-3">Ưu đãi & điều kiện</th>
                                <th className="px-4 py-3">Thời hạn</th>
                                <th className="px-4 py-3">Lượt dùng</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-admin-muted">
                                        <TicketPercent size={34} className="mx-auto mb-2 opacity-50" />
                                        Chưa có voucher nào.
                                    </td>
                                </tr>
                            ) : (
                                items.map((voucher) => {
                                    const status = getStatus(voucher);
                                    return (
                                        <tr key={voucher.id} className="hover:bg-admin-bg/25">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-admin-accent-soft p-1">
                                                        <VoucherTypeIcon type={voucher.discountType} />
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-admin-ink">{voucher.code}</p>
                                                        <p className="max-w-52 truncate text-xs text-admin-muted">{voucher.title}</p>
                                                        {voucher.showOnHomepage && (
                                                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-admin-accent">
                                                                <Eye size={11} /> Homepage
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-admin-ink">{benefitLabel(voucher)}</p>
                                                <p className="text-xs text-admin-muted">Đơn tối thiểu {formatCurrency(voucher.minOrderValue)}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-admin-muted">
                                                <p>Từ {new Date(voucher.startsAt).toLocaleDateString("vi-VN")}</p>
                                                <p>Đến {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}</p>
                                            </td>
                                            <td className="px-4 py-3 text-admin-ink">
                                                <strong>{voucher.usedCount}</strong> / {voucher.usageLimit ?? "∞"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(voucher)}
                                                        aria-label={`Sửa voucher ${voucher.code}`}
                                                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-accent"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(voucher)}
                                                        aria-label={`Xóa voucher ${voucher.code}`}
                                                        className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                    <div className="flex max-h-[94vh] w-full max-w-3xl flex-col rounded-2xl border border-admin-border bg-admin-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
                                    <TicketPercent size={18} />
                                </span>
                                <div>
                                    <h2 className="font-bold text-admin-ink">{editingId ? "Chỉnh sửa voucher" : "Thêm voucher mới"}</h2>
                                    <p className="text-xs text-admin-muted">Áp dụng cho toàn bộ sản phẩm trong đơn hàng.</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setModalOpen(false)} className="grid size-8 place-items-center rounded-lg text-admin-muted hover:bg-admin-bg">
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="text-sm font-medium text-admin-ink">
                                    Mã voucher <span className="text-rose-500">*</span>
                                    <input required maxLength={50} placeholder="DANA50K" className={`${fieldClass} font-bold uppercase`} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, "") })} />
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Tên chương trình <span className="text-rose-500">*</span>
                                    <input required maxLength={150} placeholder="Ưu đãi đơn từ 350K" className={fieldClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                                </label>
                            </div>

                            <label className="block text-sm font-medium text-admin-ink">
                                Mô tả
                                <textarea rows={2} maxLength={500} placeholder="Nội dung ngắn hiển thị cho khách hàng..." className={fieldClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="text-sm font-medium text-admin-ink">
                                    Kiểu giảm
                                    <select
                                        className={fieldClass}
                                        value={form.discountType}
                                        onChange={(event) => {
                                            const discountType = event.target.value as VoucherForm["discountType"];
                                            setForm({
                                                ...form,
                                                discountType,
                                                discountValue: discountType === "FREE_SHIPPING" ? "0" : form.discountValue === "0" ? "10000" : form.discountValue,
                                                maxDiscount: discountType === "PERCENTAGE" ? form.maxDiscount : "",
                                            });
                                        }}
                                    >
                                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                        <option value="PERCENTAGE">Phần trăm</option>
                                        <option value="FREE_SHIPPING">Miễn/giảm phí vận chuyển</option>
                                    </select>
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    {form.discountType === "PERCENTAGE"
                                        ? "Phần trăm giảm (%)"
                                        : form.discountType === "FREE_SHIPPING"
                                            ? "Giảm phí tối đa (₫)"
                                            : "Số tiền giảm (₫)"}
                                    <input
                                        required
                                        type="number"
                                        min={
                                            form.discountType === "FREE_SHIPPING"
                                                ? 0
                                                : form.discountType === "PERCENTAGE"
                                                    ? 1
                                                    : 1000
                                        }
                                        max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                                        step={form.discountType === "PERCENTAGE" ? 1 : 1000}
                                        className={fieldClass}
                                        value={form.discountValue}
                                        onChange={(event) => setForm({ ...form, discountValue: event.target.value })}
                                    />
                                    {form.discountType === "FREE_SHIPPING" && (
                                        <span className="mt-1 block text-[11px] font-normal text-admin-muted">
                                            Nhập 0 để miễn toàn bộ phí, hoặc nhập số tiền giảm tối đa.
                                        </span>
                                    )}
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Đơn tối thiểu (₫)
                                    <input required type="number" min={0} step={1000} className={fieldClass} value={form.minOrderValue} onChange={(event) => setForm({ ...form, minOrderValue: event.target.value })} />
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Giảm tối đa (₫)
                                    <input type="number" min={1000} step={1000} disabled={form.discountType !== "PERCENTAGE"} placeholder="Không giới hạn" className={`${fieldClass} disabled:bg-admin-bg disabled:opacity-60`} value={form.maxDiscount} onChange={(event) => setForm({ ...form, maxDiscount: event.target.value })} />
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="text-sm font-medium text-admin-ink">
                                    Bắt đầu
                                    <input required type="datetime-local" className={fieldClass} value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Hết hạn
                                    <input required type="datetime-local" className={fieldClass} value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Tổng lượt dùng
                                    <input type="number" min={1} placeholder="Không giới hạn" className={fieldClass} value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} />
                                </label>
                                <label className="text-sm font-medium text-admin-ink">
                                    Vị trí homepage
                                    <input type="number" min={0} className={fieldClass} value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} />
                                </label>
                            </div>

                            <div className="grid gap-3 rounded-xl border border-admin-border bg-admin-bg/35 p-4 sm:grid-cols-2">
                                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-admin-ink">
                                    <input type="checkbox" className="size-4 accent-admin-accent" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
                                    <span className="flex items-center gap-2">{form.isActive ? <Eye size={16} /> : <EyeOff size={16} />} Kích hoạt voucher</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-admin-ink">
                                    <input type="checkbox" className="size-4 accent-admin-accent" checked={form.showOnHomepage} onChange={(event) => setForm({ ...form, showOnHomepage: event.target.checked })} />
                                    <span className="flex items-center gap-2"><CalendarClock size={16} /> Hiển thị trên homepage</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg">Hủy</button>
                                <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-admin-accent px-5 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60">
                                    {busy && <Loader2 size={15} className="animate-spin" />}
                                    {busy ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo voucher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
                        <h3 className="font-bold text-admin-ink">Xóa voucher {deleteTarget.code}?</h3>
                        <p className="mt-2 text-sm text-admin-muted">
                            Voucher đã có lịch sử đơn hàng sẽ được tạm ngưng thay vì xóa vĩnh viễn.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg">Hủy</button>
                            <button type="button" disabled={busy} onClick={() => void performDelete()} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60">
                                {busy && <Loader2 size={15} className="animate-spin" />} Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
