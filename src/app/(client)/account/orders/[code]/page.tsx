import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, MapPin, Truck } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chi tiết đơn hàng | DanaFarm" };

const STATUS_LABEL: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PACKING: "Đang đóng gói",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

const STATUS_CLASS: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PACKING: "bg-indigo-50 text-indigo-700",
    SHIPPING: "bg-sky-50 text-sky-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/account/orders");

    const { code } = await params;
    const order = await prisma.order.findUnique({ where: { code }, include: { items: true } });
    if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

    return (
        <AccountShell
            breadcrumb={
                <Breadcrumb
                    items={[
                        { label: "Tài khoản", href: "/account" },
                        { label: "Đơn hàng của tôi", href: "/account/orders" },
                        { label: `#${order.code}` },
                    ]}
                />
            }
        >
            <section className="space-y-6 rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600" size={28} />
                        <div>
                            <h1 className="text-xl font-bold uppercase text-shop-title md:text-2xl">Đơn hàng #{order.code}</h1>
                            <p className="text-sm text-shop-text/60">
                                Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                </div>

                <div className="rounded-xl border border-shop-border p-5">
                    <OrderStatusTimeline status={order.status} />
                </div>

                {order.paymentMethod === "BANK_TRANSFER" && (
                    <div className="rounded-xl border border-shop-main/30 bg-shop-main/5 p-5 text-sm text-shop-text/80">
                        Đơn hàng của bạn chọn hình thức <strong className="text-shop-title">chuyển khoản ngân hàng</strong>.
                        Chúng tôi sẽ liên hệ để gửi hướng dẫn thanh toán trong thời gian sớm nhất.
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-shop-border p-4">
                        <p className="flex items-center gap-2 font-semibold text-shop-title">
                            <MapPin size={17} /> Địa chỉ giao hàng
                        </p>
                        <p className="mt-2 text-sm text-shop-text/80">
                            {order.recipientName} · {order.phone}
                            <br />
                            {order.addressLine}, {order.wardName}, {order.provinceName}
                        </p>
                    </div>
                    <div className="rounded-xl border border-shop-border p-4">
                        <p className="flex items-center gap-2 font-semibold text-shop-title">
                            <Truck size={17} /> Vận chuyển & Thanh toán
                        </p>
                        <p className="mt-2 text-sm text-shop-text/80">
                            Phương thức: {order.paymentMethod === "COD" ? "Thanh toán khi giao hàng (COD)" : "Chuyển khoản ngân hàng"}
                            <br />
                            {order.distanceKm != null && <>Khoảng cách ước tính: ~{order.distanceKm}km</>}
                        </p>
                        {order.note && <p className="mt-2 text-sm italic text-shop-text/60">Ghi chú: {order.note}</p>}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-shop-border">
                    <div className="divide-y divide-shop-border">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4">
                                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-shop-border bg-shop-bg">
                                    {item.imageUrl && (
                                        <Image src={item.imageUrl} alt={item.productName} fill sizes="64px" className="object-contain p-1" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-shop-title">{item.productName}</p>
                                    {item.variantName && <p className="text-sm text-shop-text/55">{item.variantName}</p>}
                                    <p className="text-sm text-shop-text/60">
                                        {formatCurrency(item.price)} × {item.quantity}
                                    </p>
                                </div>
                                <strong className="text-shop-main">{formatCurrency(item.lineTotal)}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 border-t border-shop-border bg-shop-bg p-4 text-sm">
                        <div className="flex justify-between text-shop-text/70">
                            <span>Tạm tính</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-shop-text/70">
                            <span>Phí vận chuyển</span>
                            <span>{order.shippingFee === 0 ? "Miễn phí" : formatCurrency(order.shippingFee)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-shop-text/70">
                                <span>Giảm giá</span>
                                <span>-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-shop-border pt-2 text-base font-bold text-shop-title">
                            <span>Tổng cộng</span>
                            <span className="text-shop-main">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                <ButtonLink href="/account/orders" variant="outline">
                    Xem tất cả đơn hàng
                </ButtonLink>
            </section>
        </AccountShell>
    );
}
