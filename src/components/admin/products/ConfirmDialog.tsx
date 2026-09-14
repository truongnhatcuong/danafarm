"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Xóa",
    cancelLabel = "Hủy",
    busy = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={onCancel}>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
                        <AlertTriangle size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h3 id="confirm-dialog-title" className="text-sm font-bold text-admin-ink">
                            {title}
                        </h3>
                        {description && <p className="mt-1 text-sm text-admin-muted">{description}</p>}
                    </div>
                    <button
                        type="button"
                        aria-label="Đóng"
                        onClick={onCancel}
                        className="grid size-7 shrink-0 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg"
                    >
                        <X size={15} />
                    </button>
                </div>
                <div className="mt-5 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink transition hover:bg-admin-bg"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onConfirm}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
                    >
                        {busy && <Loader2 size={14} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
