"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Loader2, TicketPercent, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { getVoucherImagePath } from "@/lib/vouchers";

export type CheckoutVoucher = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    discountType: "FIXED_AMOUNT" | "PERCENTAGE" | "FREE_SHIPPING";
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number | null;
    expiresAt: string;
};

export type AppliedVoucher = CheckoutVoucher & { discount: number };

function benefitLabel(voucher: CheckoutVoucher) {
    if (voucher.discountType === "FREE_SHIPPING") {
        return voucher.discountValue > 0
            ? `Giảm tối đa ${formatCurrency(voucher.discountValue)} phí vận chuyển`
            : "Miễn phí vận chuyển";
    }
    if (voucher.discountType === "PERCENTAGE") {
        return `Giảm ${voucher.discountValue}%${voucher.maxDiscount ? `, tối đa ${formatCurrency(voucher.maxDiscount)}` : ""}`;
    }
    return `Giảm ${formatCurrency(voucher.discountValue)}`;
}

function VoucherTypeIcon({ type }: { type: CheckoutVoucher["discountType"] }) {
    return <Image src={getVoucherImagePath(type)} alt="" width={36} height={36} className="size-9 object-contain" />;
}

export function VoucherPicker({
    subtotal,
    shippingFee,
    vouchers,
    appliedVoucher,
    onApplied,
    onRemoved,
}: {
    subtotal: number;
    shippingFee: number;
    vouchers: CheckoutVoucher[];
    appliedVoucher: AppliedVoucher | null;
    onApplied: (voucher: AppliedVoucher) => void;
    onRemoved: () => void;
}) {
    const [code, setCode] = useState("");
    const [loadingCode, setLoadingCode] = useState<string | null>(null);

    async function applyVoucher(rawCode: string) {
        const normalizedCode = rawCode.trim().toUpperCase();
        if (!normalizedCode) {
            toast.error("Vui lòng nhập mã giảm giá.");
            return;
        }

        setLoadingCode(normalizedCode);
        try {
            const query = new URLSearchParams({
                code: normalizedCode,
                subtotal: String(subtotal),
                shippingFee: String(shippingFee),
            });
            const response = await fetch(`/api/vouchers?${query.toString()}`);
            const body = await response.json();
            if (!response.ok) throw new Error(body.error ?? "Không thể áp dụng mã giảm giá.");

            onApplied({ ...body.data, expiresAt: String(body.data.expiresAt), discount: body.discount });
            setCode(normalizedCode);
            toast.success(`Đã áp dụng mã ${normalizedCode}.`);
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kiểm tra mã giảm giá.");
        } finally {
            setLoadingCode(null);
        }
    }

    return (
        <section className="rounded-2xl border border-shop-border bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-bold text-shop-title">
                    <TicketPercent size={19} className="text-shop-main" /> 3. Mã giảm giá
                </h2>
                {appliedVoucher && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <Check size={13} /> Đã áp dụng
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            void applyVoucher(code);
                        }
                    }}
                    placeholder="Nhập mã voucher"
                    className="min-w-0 flex-1 rounded-lg border border-shop-border bg-white px-4 py-2.5 text-sm font-semibold uppercase outline-none transition focus:border-shop-main"
                />
                <button
                    type="button"
                    disabled={loadingCode !== null}
                    onClick={() => void applyVoucher(code)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-shop-main px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
                >
                    {loadingCode && <Loader2 size={15} className="animate-spin" />}
                    Áp dụng
                </button>
            </div>

            {appliedVoucher && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-emerald-800">
                            {appliedVoucher.code} · {appliedVoucher.title}
                        </p>
                        <p className="text-xs text-emerald-700">Tiết kiệm {formatCurrency(appliedVoucher.discount)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onRemoved();
                            setCode("");
                        }}
                        aria-label="Gỡ mã giảm giá"
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-emerald-700 transition hover:bg-emerald-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {vouchers.length > 0 && (
                <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-shop-text/55">Voucher dành cho bạn</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {vouchers.map((voucher) => {
                            const eligible =
                                subtotal >= voucher.minOrderValue &&
                                (voucher.discountType !== "FREE_SHIPPING" || shippingFee > 0);
                            const isApplied = appliedVoucher?.id === voucher.id;
                            return (
                                <article
                                    key={voucher.id}
                                    className={`relative overflow-hidden rounded-xl border p-3.5 ${isApplied
                                        ? "border-shop-main bg-shop-main/5"
                                        : eligible
                                            ? "border-shop-border bg-[#fffaf0]"
                                            : "border-shop-border bg-slate-50 opacity-65"
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-shop-button/70 p-1">
                                            <VoucherTypeIcon type={voucher.discountType} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-shop-title">{benefitLabel(voucher)}</p>
                                            <p className="mt-0.5 text-xs text-shop-text/65">Đơn từ {formatCurrency(voucher.minOrderValue)}</p>
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <code className="rounded bg-white px-2 py-1 text-xs font-bold text-shop-main">{voucher.code}</code>
                                                <button
                                                    type="button"
                                                    disabled={!eligible || loadingCode !== null || isApplied}
                                                    onClick={() => void applyVoucher(voucher.code)}
                                                    className="rounded-full bg-shop-button px-3 py-1 text-xs font-bold text-shop-title transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isApplied
                                                        ? "Đã dùng"
                                                        : eligible
                                                            ? "Dùng mã"
                                                            : voucher.discountType === "FREE_SHIPPING" && shippingFee === 0
                                                                ? "Đã miễn phí ship"
                                                                : "Chưa đủ điều kiện"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
