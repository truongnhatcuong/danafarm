"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "PACKING", label: "Đang đóng gói" },
    { value: "SHIPPING", label: "Đang giao hàng" },
    { value: "DELIVERED", label: "Đã giao hàng" },
    { value: "CANCELLED", label: "Đã hủy" },
];

export function OrderStatusControl({ orderId, status }: { orderId: number; status: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function updateStatus(nextStatus: string) {
        setBusy(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error ?? "Không thể cập nhật trạng thái.");
            toast.success("Đã cập nhật trạng thái đơn hàng.");
            router.refresh();
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <select
                disabled={busy}
                defaultValue={status}
                onChange={(e) => updateStatus(e.target.value)}
                className="rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm font-semibold text-admin-ink outline-none focus:border-admin-accent"
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {busy && <Loader2 size={16} className="animate-spin text-admin-muted" />}
        </div>
    );
}
