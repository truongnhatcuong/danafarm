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

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy thanh toán" },
  { value: "FAILED", label: "Thanh toán thất bại" },
];

export function OrderStatusControl({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: number;
  status: string;
  paymentStatus?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(payload: { status?: string; paymentStatus?: string }) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error ?? "Không thể cập nhật trạng thái.");
      toast.success("Đã cập nhật trạng thái thành công.");
      router.refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Không thể kết nối tới máy chủ.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-admin-muted">Đơn hàng:</span>
        <select
          disabled={busy}
          defaultValue={status}
          onChange={(e) => update({ status: e.target.value })}
          className="cursor-pointer rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-ink outline-none focus:border-admin-accent"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {paymentStatus && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-admin-muted">
            Thanh toán:
          </span>
          <select
            disabled={busy}
            defaultValue={paymentStatus}
            onChange={(e) => update({ paymentStatus: e.target.value })}
            className="cursor-pointer rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-ink outline-none focus:border-admin-accent"
          >
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {busy && <Loader2 size={16} className="animate-spin text-admin-muted" />}
    </div>
  );
}
