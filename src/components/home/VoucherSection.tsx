"use client";

import { useState } from "react";
import { BadgePercent, Check, Copy, Gift, Percent, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { formatCurrency } from "@/lib/utils";

export type HomeVoucher = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    discountType: "FIXED_AMOUNT" | "PERCENTAGE";
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number | null;
    expiresAt: string;
};

const iconStyles = [
    "bg-amber-300 text-amber-900",
    "bg-orange-300 text-orange-900",
    "bg-emerald-200 text-emerald-900",
    "bg-rose-200 text-rose-900",
];

function VoucherIcon({ index }: { index: number }) {
    const icons = [Gift, TicketPercent, BadgePercent, Percent];
    const Icon = icons[index % icons.length];
    return <Icon size={44} strokeWidth={1.8} />;
}

function discountLabel(voucher: HomeVoucher) {
    return voucher.discountType === "PERCENTAGE"
        ? `Giảm ${voucher.discountValue}%`
        : `Giảm ${formatCurrency(voucher.discountValue)}`;
}

export function VoucherSection({ vouchers }: { vouchers: HomeVoucher[] }) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    if (vouchers.length === 0) return null;

    async function copyCode(code: string) {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success(`Đã sao chép mã ${code}.`);
            window.setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1800);
        } catch {
            toast.error("Không thể sao chép mã. Vui lòng sao chép thủ công.");
        }
    }

    return (
        <section className="py-8 md:py-10">
            <Container>
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-shop-main">Ưu đãi DanaFarm</p>
                        <h2 className="mt-1 text-2xl font-bold text-shop-title md:text-3xl">Khuyến mãi dành cho bạn</h2>
                    </div>
                    <p className="hidden text-sm text-shop-text/60 md:block">Sao chép mã và sử dụng khi thanh toán</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {vouchers.map((voucher, index) => (
                        <article
                            key={voucher.id}
                            className="group relative flex min-h-36 overflow-hidden rounded-2xl border border-shop-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div
                                className={`relative grid w-28 shrink-0 place-items-center ${iconStyles[index % iconStyles.length]}`}
                            >
                                <VoucherIcon index={index} />
                                <span className="absolute -right-3 -top-3 size-6 rounded-full border border-shop-border bg-shop-bg" />
                                <span className="absolute -bottom-3 -right-3 size-6 rounded-full border border-shop-border bg-shop-bg" />
                            </div>
                            <div className="relative min-w-0 flex-1 border-l border-dashed border-shop-border p-3">
                                <h3 className="text-lg font-bold text-shop-title">{discountLabel(voucher)}</h3>
                                <p className="mt-1 text-sm text-shop-text/75">Đơn hàng từ {formatCurrency(voucher.minOrderValue)}</p>
                                {voucher.discountType === "PERCENTAGE" && voucher.maxDiscount && (
                                    <p className="text-xs text-shop-text/55">Giảm tối đa {formatCurrency(voucher.maxDiscount)}</p>
                                )}
                                <div className="mt-4 flex items-end justify-between gap-2">
                                    <div className="min-w-0 text-xs text-shop-text/70">
                                        <p>
                                            Mã: <strong className="text-shop-title">{voucher.code}</strong>
                                        </p>
                                        <p>HSD: {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void copyCode(voucher.code)}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-shop-button px-3 py-1.5 text-xs font-bold text-shop-title transition hover:brightness-95"
                                    >
                                        {copiedCode === voucher.code ? <Check size={13} /> : <Copy size={13} />}
                                        {copiedCode === voucher.code ? "Đã chép" : "Sao chép"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </Container>
        </section>
    );
}
