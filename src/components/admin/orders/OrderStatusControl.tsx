"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy thanh toán",
  FAILED: "Thanh toán thất bại",
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKING", "CANCELLED"],
  PACKING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const NEXT_PAYMENT: Record<string, string[]> = {
  PENDING: ["PAID", "FAILED", "CANCELLED"],
  PAID: [],
  FAILED: ["PENDING"],
  CANCELLED: ["PENDING"],
};

function requiresConfirmation(type: "order" | "payment", value: string) {
  return (
    value === "CANCELLED" ||
    value === "DELIVERED" ||
    (type === "payment" && value === "PAID")
  );
}

export function OrderStatusControl({
  orderId,
  status,
  paymentStatus,
  previousStatus,
  previousPaymentStatus,
}: {
  orderId: number;
  status: string;
  paymentStatus?: string;
  previousStatus?: string | null;
  previousPaymentStatus?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(
    payload: { status?: string; paymentStatus?: string; undo?: boolean },
  ) {
    const type = payload.status ? "order" : "payment";
    const next = payload.status ?? payload.paymentStatus!;
    const label = type === "order" ? STATUS_LABELS[next] : PAYMENT_LABELS[next];
    if (
      (payload.undo || requiresConfirmation(type, next)) &&
      !window.confirm(
        payload.undo
          ? `Hoàn tác về trạng thái “${label}”? Tồn kho và voucher sẽ được đồng bộ lại nếu cần.`
          : `Xác nhận chuyển sang “${label}”?`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Không thể cập nhật trạng thái.");
      }
      toast.success(payload.undo ? "Đã hoàn tác trạng thái." : "Đã cập nhật trạng thái.");
      router.refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.",
      );
    } finally {
      setBusy(false);
    }
  }

  const orderOptions = NEXT_STATUS[status] ?? [];
  const paymentOptions = paymentStatus ? NEXT_PAYMENT[paymentStatus] ?? [] : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-admin-muted">Đơn hàng:</span>
        <select
          disabled={busy || orderOptions.length === 0}
          value=""
          onChange={(event) => {
            if (event.target.value) void update({ status: event.target.value });
          }}
          className="cursor-pointer rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-ink outline-none focus:border-admin-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{STATUS_LABELS[status]}</option>
          {orderOptions.map((value) => (
            <option key={value} value={value}>
              → {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        {previousStatus && previousStatus !== status && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void update({ status: previousStatus, undo: true })}
            className="inline-flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-2 text-xs font-semibold text-admin-muted hover:text-admin-ink disabled:opacity-50"
          >
            <Undo2 size={13} /> Hoàn tác
          </button>
        )}
      </div>

      {paymentStatus && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-admin-muted">Thanh toán:</span>
          <select
            disabled={busy || paymentOptions.length === 0}
            value=""
            onChange={(event) => {
              if (event.target.value) {
                void update({ paymentStatus: event.target.value });
              }
            }}
            className="cursor-pointer rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-ink outline-none focus:border-admin-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{PAYMENT_LABELS[paymentStatus]}</option>
            {paymentOptions.map((value) => (
              <option key={value} value={value}>
                → {PAYMENT_LABELS[value]}
              </option>
            ))}
          </select>
          {previousPaymentStatus && previousPaymentStatus !== paymentStatus && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void update({ paymentStatus: previousPaymentStatus, undo: true })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-2 text-xs font-semibold text-admin-muted hover:text-admin-ink disabled:opacity-50"
            >
              <Undo2 size={13} /> Hoàn tác
            </button>
          )}
        </div>
      )}

      {busy && <Loader2 size={16} className="animate-spin text-admin-muted" />}
    </div>
  );
}
