"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function CustomerCancelOrder({ orderCode }: { orderCode: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function cancelOrder() {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(orderCode)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "CANCEL" }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error ?? "Không thể hủy đơn hàng.");
            }

            setOpen(false);
            toast.success("Đơn hàng đã được hủy. Tồn kho và voucher đã được hoàn lại.");
            router.refresh();
        } catch (cause) {
            toast.error(
                cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
                Hủy đơn hàng
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !submitting) setOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-order-title"
                        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                                    <AlertTriangle size={21} />
                                </span>
                                <div>
                                    <h2 id="cancel-order-title" className="font-bold text-shop-title">
                                        Xác nhận hủy đơn #{orderCode}
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-shop-text/70">
                                        Thao tác sẽ hủy đơn, hoàn lại tồn kho và quyền sử dụng voucher.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng"
                                disabled={submitting}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-shop-text/50 hover:bg-shop-bg hover:text-shop-title disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-shop-border px-4 py-2.5 text-sm font-semibold text-shop-text hover:bg-shop-bg disabled:opacity-50"
                            >
                                Giữ đơn hàng
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => void cancelOrder()}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                {submitting ? "Đang hủy..." : "Xác nhận hủy đơn"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
