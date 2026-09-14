import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đơn hàng của tôi | DanaFarm" };

const PAGE_SIZE = 10;

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERED", "CANCELLED"] as const;

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

type OrdersPageProps = {
    searchParams: Promise<{ page?: string; status?: string }>;
};

function buildHref(page: number, status: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/account/orders?${query}` : "/account/orders";
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/account/orders");

    const query = await searchParams;
    const status = (ORDER_STATUSES as readonly string[]).includes(query.status ?? "") ? query.status! : "";
    const rawPage = Number(query.page);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const where = { userId: user.id, ...(status ? { status: status as (typeof ORDER_STATUSES)[number] } : {}) };

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select: {
                id: true,
                code: true,
                status: true,
                total: true,
                createdAt: true,
                _count: { select: { items: true } },
            },
        }),
        prisma.order.count({ where }),
    ]);
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <AccountShell
            breadcrumb={<Breadcrumb items={[{ label: "Tài khoản", href: "/account" }, { label: "Đơn hàng của tôi" }]} />}
        >
            <section className="rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Receipt className="text-shop-main" size={28} />
                        <h1 className="text-2xl font-bold uppercase text-shop-title">Đơn hàng của tôi</h1>
                    </div>
                    {total > 0 && <span className="text-sm text-shop-text/55">{total} đơn hàng</span>}
                </div>

                <div className="my-5 flex flex-wrap gap-2 overflow-x-auto pb-1">
                    <Link
                        href={buildHref(1, "")}
                        className={cn(
                            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                            status === "" ? "bg-shop-main text-white" : "bg-shop-bg text-shop-text/70 hover:bg-shop-border",
                        )}
                    >
                        Tất cả
                    </Link>
                    {ORDER_STATUSES.map((s) => (
                        <Link
                            key={s}
                            href={buildHref(1, s)}
                            className={cn(
                                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                                status === s ? "bg-shop-main text-white" : "bg-shop-bg text-shop-text/70 hover:bg-shop-border",
                            )}
                        >
                            {STATUS_LABEL[s]}
                        </Link>
                    ))}
                </div>

                {orders.length === 0 ? (
                    <div className="my-8 rounded-xl border border-dashed border-shop-border bg-shop-bg p-8 text-center">
                        <p className="font-semibold text-shop-title">
                            {status ? "Không có đơn hàng nào ở trạng thái này." : "Bạn chưa có đơn hàng nào."}
                        </p>
                        <ButtonLink href="/collections/all" className="mt-4">
                            Bắt đầu mua sắm
                        </ButtonLink>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-3">
                            {orders.map((order) => (
                                <li key={order.id}>
                                    <Link
                                        href={`/account/orders/${order.code}`}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-shop-border bg-white p-4 transition-colors hover:border-shop-main/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-shop-title">#{order.code}</p>
                                            <p className="mt-1 text-sm text-shop-text/60">
                                                {order._count.items} sản phẩm ·{" "}
                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-700"}`}
                                            >
                                                {STATUS_LABEL[order.status] ?? order.status}
                                            </span>
                                            <strong className="text-shop-main">{formatCurrency(order.total)}</strong>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {pageCount > 1 && (
                            <div className="mt-6 flex items-center justify-between gap-3 border-t border-shop-border pt-5 text-sm">
                                <Link
                                    href={buildHref(page - 1, status)}
                                    aria-disabled={page <= 1}
                                    className={cn(
                                        "flex items-center gap-1 rounded-lg border border-shop-border px-3 py-1.5 font-medium transition-colors hover:bg-shop-bg",
                                        page <= 1 && "pointer-events-none opacity-40",
                                    )}
                                >
                                    <ChevronLeft size={15} /> Trước
                                </Link>
                                <span className="text-shop-text/60">
                                    Trang {page} / {pageCount}
                                </span>
                                <Link
                                    href={buildHref(page + 1, status)}
                                    aria-disabled={page >= pageCount}
                                    className={cn(
                                        "flex items-center gap-1 rounded-lg border border-shop-border px-3 py-1.5 font-medium transition-colors hover:bg-shop-bg",
                                        page >= pageCount && "pointer-events-none opacity-40",
                                    )}
                                >
                                    Sau <ChevronRight size={15} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>
        </AccountShell>
    );
}
