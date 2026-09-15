"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Loader2, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddressSelector, type CheckoutAddress } from "@/components/checkout/AddressSelector";
import {
    VoucherPicker,
    type AppliedVoucher,
    type CheckoutVoucher,
} from "@/components/checkout/VoucherPicker";
import { calculateShippingFee, type ShippingConfig } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

type PaymentMethod = "COD" | "BANK_TRANSFER";

export function CheckoutClient({
    shippingConfig,
    vouchers,
}: {
    shippingConfig: ShippingConfig;
    vouchers: CheckoutVoucher[];
}) {
    const router = useRouter();
    const hydrated = useCartStore((state) => state.hydrated);
    const activeUserId = useCartStore((state) => state.activeUserId);
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clear);

    const [address, setAddress] = useState<CheckoutAddress | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);

    useEffect(() => {
        if (hydrated && activeUserId !== null && items.length === 0) {
            router.replace("/cart");
        }
    }, [hydrated, activeUserId, items.length, router]);

    const subtotal = useMemo(
        () => items.reduce((total, item) => total + item.price * item.quantity, 0),
        [items],
    );

    const quote = useMemo(() => {
        if (!address) return { distanceKm: null, shippingFee: 0, isFreeShip: false };
        return calculateShippingFee(address.provinceCode, subtotal, shippingConfig);
    }, [address, subtotal, shippingConfig]);

    const discount = appliedVoucher?.discount ?? 0;
    const total = Math.max(0, subtotal + quote.shippingFee - discount);

    async function handleSubmit() {
        if (!address) {
            toast.error("Vui lòng chọn địa chỉ giao hàng.");
            return;
        }
        if (items.length === 0) return;

        setSubmitting(true);
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    addressId: address.id,
                    paymentMethod,
                    note: note.trim() || undefined,
                    voucherCode: appliedVoucher?.code,
                    items: items.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    })),
                }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body?.error ?? "Không thể đặt hàng.");

            clearCart();
            toast.success("Đặt hàng thành công!");
            router.push(`/account/orders/${body.data.code}`);
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!hydrated) {
        return (
            <div className="rounded-2xl border border-shop-border bg-white p-10 text-center text-shop-text/60">
                Đang tải...
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-shop-border bg-white px-5 py-14 text-center">
                <ShoppingBag className="mx-auto mb-4 text-shop-main/60" size={54} />
                <h2 className="text-xl font-bold text-shop-title">Giỏ hàng đang trống</h2>
                <p className="mt-2 text-sm text-shop-text/65">Vui lòng chọn sản phẩm trước khi đặt hàng.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
                <section className="rounded-2xl border border-shop-border bg-white p-5 md:p-6">
                    <h2 className="mb-4 font-bold text-shop-title">1. Địa chỉ giao hàng</h2>
                    <AddressSelector onSelect={setAddress} />
                </section>

                <section className="rounded-2xl border border-shop-border bg-white p-5 md:p-6">
                    <h2 className="mb-4 font-bold text-shop-title">2. Phương thức thanh toán</h2>
                    <div className="space-y-3">
                        <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${paymentMethod === "COD" ? "border-shop-main bg-shop-main/5" : "border-shop-border bg-white hover:border-shop-main/40"
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                className="mt-1 size-4 accent-shop-main"
                                checked={paymentMethod === "COD"}
                                onChange={() => setPaymentMethod("COD")}
                            />
                            <div>
                                <p className="flex items-center gap-2 font-semibold text-shop-title">
                                    <Truck size={17} /> Thanh toán khi giao hàng (COD)
                                </p>
                                <p className="mt-1 text-sm text-shop-text/65">
                                    Bạn thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được đơn hàng.
                                </p>
                            </div>
                        </label>

                        <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${paymentMethod === "BANK_TRANSFER"
                                    ? "border-shop-main bg-shop-main/5"
                                    : "border-shop-border bg-white hover:border-shop-main/40"
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                className="mt-1 size-4 accent-shop-main"
                                checked={paymentMethod === "BANK_TRANSFER"}
                                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                            />
                            <div>
                                <p className="flex items-center gap-2 font-semibold text-shop-title">
                                    <Banknote size={17} /> Chuyển khoản qua ngân hàng
                                </p>
                                <p className="mt-1 text-sm text-shop-text/65">
                                    Chúng tôi sẽ liên hệ để gửi thông tin và hướng dẫn chuyển khoản sau khi đặt hàng.
                                </p>
                            </div>
                        </label>
                    </div>
                </section>

                <VoucherPicker
                    subtotal={subtotal}
                    vouchers={vouchers}
                    appliedVoucher={appliedVoucher}
                    onApplied={setAppliedVoucher}
                    onRemoved={() => setAppliedVoucher(null)}
                />

                <section className="rounded-2xl border border-shop-border bg-white p-5 md:p-6">
                    <h2 className="mb-4 font-bold text-shop-title">4. Ghi chú (không bắt buộc)</h2>
                    <textarea
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                        className="w-full rounded-lg border border-shop-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-shop-main"
                    />
                </section>
            </div>

            <aside className="h-fit space-y-4 rounded-2xl border border-shop-border bg-white p-5 lg:sticky lg:top-5">
                <h2 className="border-b border-shop-border pb-4 font-bold text-shop-title">Đơn hàng ({items.length} sản phẩm)</h2>
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {items.map((item) => (
                        <div key={item.key} className="flex gap-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-shop-border bg-shop-bg">
                                {item.imageUrl && (
                                    <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-contain p-1" />
                                )}
                                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-shop-main text-[10px] font-bold text-white">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-shop-title">{item.name}</p>
                                {item.variantName && <p className="text-xs text-shop-text/55">{item.variantName}</p>}
                                <p className="text-sm font-semibold text-shop-main">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 border-t border-shop-border pt-4 text-sm">
                    <div className="flex items-center justify-between text-shop-text/70">
                        <span>Tạm tính</span>
                        <span className="font-medium text-shop-title">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-shop-text/70">
                        <span>Phí vận chuyển{quote.distanceKm != null ? ` (~${quote.distanceKm}km)` : ""}</span>
                        <span className="font-medium text-shop-title">
                            {quote.isFreeShip ? "Miễn phí" : formatCurrency(quote.shippingFee)}
                        </span>
                    </div>
                    {appliedVoucher && (
                        <div className="flex items-center justify-between text-emerald-700">
                            <span>Voucher ({appliedVoucher.code})</span>
                            <span className="font-semibold">-{formatCurrency(discount)}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-shop-border pt-4">
                    <span className="font-semibold text-shop-title">Tổng cộng</span>
                    <strong className="text-xl text-shop-main">{formatCurrency(total)}</strong>
                </div>

                <Button onClick={handleSubmit} disabled={submitting || !address} className="w-full">
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
                </Button>
                <Link href="/cart" className="block text-center text-sm text-shop-text/60 hover:text-shop-main hover:underline">
                    Quay lại giỏ hàng
                </Link>
            </aside>
        </div>
    );
}
