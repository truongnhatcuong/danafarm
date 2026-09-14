import Link from "next/link";
import {
    ArrowUpRight,
    FileText,
    Inbox,
    LayoutGrid,
    Mail,
    Minus,
    Newspaper,
    Package,
    Phone,
    PlusCircle,
    Receipt,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { prisma } from "@/lib/prisma";

const DAY_MS = 86_400_000;

async function countWithTrend(
    model: { count: (args?: { where?: { createdAt?: { gte?: Date; lt?: Date } } }) => Promise<number> },
) {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * DAY_MS);
    const start60 = new Date(now.getTime() - 60 * DAY_MS);

    const [total, current, previous] = await Promise.all([
        model.count(),
        model.count({ where: { createdAt: { gte: start30 } } }),
        model.count({ where: { createdAt: { gte: start60, lt: start30 } } }),
    ]);

    return { total, current, previous };
}

async function revenueWithTrend() {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * DAY_MS);
    const start60 = new Date(now.getTime() - 60 * DAY_MS);

    const [totalAgg, currentAgg, previousAgg] = await Promise.all([
        prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: "CANCELLED" }, createdAt: { gte: start30 } },
        }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: "CANCELLED" }, createdAt: { gte: start60, lt: start30 } },
        }),
    ]);

    return {
        total: totalAgg._sum.total ?? 0,
        current: currentAgg._sum.total ?? 0,
        previous: previousAgg._sum.total ?? 0,
    };
}

function trendBadge({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) {
        if (current === 0) return { label: "Chưa có dữ liệu", tone: "flat" as const };
        return { label: "Mới trong 30 ngày", tone: "up" as const };
    }
    const percent = Math.round(((current - previous) / previous) * 100);
    if (percent === 0) return { label: "Không đổi so với 30 ngày trước", tone: "flat" as const };
    return {
        label: `${percent > 0 ? "+" : ""}${percent}% so với 30 ngày trước`,
        tone: percent > 0 ? ("up" as const) : ("down" as const),
    };
}

const toneStyles = {
    up: { icon: TrendingUp, className: "text-emerald-600 bg-emerald-50" },
    down: { icon: TrendingDown, className: "text-rose-600 bg-rose-50" },
    flat: { icon: Minus, className: "text-admin-muted bg-admin-bg" },
};

const currency = (value: number) => `${value.toLocaleString("vi-VN")}₫`;

function timeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
}

const ORDER_STATUS_LABEL: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PACKING: "Đang đóng gói",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

const ORDER_STATUS_CLASS: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PACKING: "bg-indigo-50 text-indigo-700",
    SHIPPING: "bg-sky-50 text-sky-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
};

export default async function AdminDashboardPage() {
    const [
        productStats,
        categoryStats,
        postStats,
        userStats,
        contactStats,
        orderStats,
        revenueStats,
        recentProducts,
        recentContacts,
        recentOrders,
    ] = await Promise.all([
        countWithTrend(prisma.product),
        countWithTrend(prisma.category),
        countWithTrend(prisma.post),
        countWithTrend({
            count: (args) => prisma.user.count({ ...args, where: { ...args?.where, role: "CUSTOMER" } }),
        }),
        countWithTrend(prisma.contactMessage),
        countWithTrend(prisma.order),
        revenueWithTrend(),
        prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, slug: true, price: true, status: true, quantity: true },
        }),
        prisma.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, code: true, status: true, total: true, recipientName: true, createdAt: true },
        }),
    ]);

    const kpis: { label: string; icon: LucideIcon; stats: { total: number; current: number; previous: number }; isCurrency?: boolean }[] = [
        { label: "Doanh thu", icon: Wallet, stats: revenueStats, isCurrency: true },
        { label: "Đơn hàng", icon: Receipt, stats: orderStats },
        { label: "Sản phẩm", icon: Package, stats: productStats },
        { label: "Danh mục", icon: LayoutGrid, stats: categoryStats },
        { label: "Bài viết", icon: Newspaper, stats: postStats },
        { label: "Khách hàng", icon: Users, stats: userStats },
        { label: "Tin nhắn", icon: Mail, stats: contactStats },
    ];

    const quickActions = [
        { label: "Xem đơn hàng", description: "Xử lý và cập nhật trạng thái đơn", href: "/admin/orders", icon: Receipt },
        { label: "Thêm sản phẩm", description: "Tạo sản phẩm mới cho cửa hàng", href: "/admin/products", icon: Package },
        { label: "Thêm danh mục", description: "Sắp xếp lại nhóm sản phẩm", href: "/admin/categories", icon: LayoutGrid },
        { label: "Viết bài mới", description: "Đăng tin tức hoặc bài viết", href: "/admin/posts", icon: FileText },
        { label: "Xem liên hệ", description: "Phản hồi khách hàng liên hệ", href: "/admin/contacts", icon: Inbox },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-admin-ink">Tổng quan hệ thống</h1>
                <p className="mt-1 text-sm text-admin-muted">Theo dõi hoạt động và quản lý dữ liệu DanaFarm.</p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                {kpis.slice(0, 2).map(({ label, icon: Icon, stats, isCurrency }) => {
                    const badge = trendBadge(stats);
                    const { icon: TrendIcon, className } = toneStyles[badge.tone];
                    return (
                        <article key={label} className="rounded-2xl border border-admin-border bg-admin-surface p-5">
                            <div className="flex items-center justify-between">
                                <span className="grid size-11 place-items-center rounded-xl bg-admin-accent-soft text-admin-accent">
                                    <Icon size={20} />
                                </span>
                                <span
                                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${className}`}
                                    title={badge.label}
                                >
                                    <TrendIcon size={13} />
                                    {badge.tone === "flat" ? "0%" : badge.label.split(" ")[0]}
                                </span>
                            </div>
                            <strong className="mt-4 block text-3xl font-bold text-admin-ink">
                                {isCurrency ? currency(stats.total) : stats.total}
                            </strong>
                            <p className="mt-1 text-sm text-admin-muted">{label} (tổng cộng)</p>
                        </article>
                    );
                })}
            </section>

            <RevenueChart />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {kpis.slice(2).map(({ label, icon: Icon, stats }) => {
                    const badge = trendBadge(stats);
                    const { icon: TrendIcon, className } = toneStyles[badge.tone];
                    return (
                        <article
                            key={label}
                            className="rounded-2xl border border-admin-border bg-admin-surface p-5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="grid size-11 place-items-center rounded-xl bg-admin-accent-soft text-admin-accent">
                                    <Icon size={20} />
                                </span>
                                <span
                                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${className}`}
                                    title={badge.label}
                                >
                                    <TrendIcon size={13} />
                                    {badge.tone === "flat" ? "0%" : badge.label.split(" ")[0]}
                                </span>
                            </div>
                            <strong className="mt-4 block text-3xl font-bold text-admin-ink">{stats.total}</strong>
                            <p className="mt-1 text-sm text-admin-muted">{label}</p>
                        </article>
                    );
                })}
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold text-admin-ink">Thao tác nhanh</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {quickActions.map(({ label, description, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-start gap-3 rounded-2xl border border-admin-border bg-admin-surface p-4 transition hover:border-admin-accent hover:bg-admin-accent-soft/40"
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-admin-bg text-admin-ink transition group-hover:bg-admin-accent group-hover:text-white">
                                <Icon size={18} />
                            </span>
                            <span className="min-w-0">
                                <span className="flex items-center gap-1 text-sm font-semibold text-admin-ink">
                                    {label}
                                    <PlusCircle size={14} className="text-admin-muted group-hover:text-admin-accent" />
                                </span>
                                <span className="mt-0.5 block text-xs text-admin-muted">{description}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
                <div className="rounded-2xl border border-admin-border bg-admin-surface">
                    <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                        <h2 className="text-sm font-semibold text-admin-ink">Đơn hàng gần đây</h2>
                        <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline">
                            Xem tất cả <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-admin-muted">Chưa có đơn hàng nào.</p>
                    ) : (
                        <ul>
                            {recentOrders.map((order) => (
                                <li key={order.id} className="border-b border-admin-border px-5 py-3 last:border-none">
                                    <div className="flex items-center justify-between gap-3">
                                        <Link href={`/admin/orders/${order.id}`} className="truncate text-sm font-medium text-admin-ink hover:text-admin-accent hover:underline">
                                            #{order.code}
                                        </Link>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ORDER_STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex items-center justify-between gap-3">
                                        <p className="truncate text-xs text-admin-muted">{order.recipientName}</p>
                                        <span className="shrink-0 text-sm font-semibold text-admin-ink">{currency(order.total)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface">
                    <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                        <h2 className="text-sm font-semibold text-admin-ink">Sản phẩm gần đây</h2>
                        <Link href="/admin/products" className="flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline">
                            Xem tất cả <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    {recentProducts.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-admin-muted">Chưa có sản phẩm nào.</p>
                    ) : (
                        <ul>
                            {recentProducts.map((product) => (
                                <li
                                    key={product.id}
                                    className="flex items-center justify-between gap-3 border-b border-admin-border px-5 py-3 last:border-none"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-admin-ink">{product.name}</p>
                                        <p className="text-xs text-admin-muted">
                                            {product.status === "active" ? "Hiển thị" : "Bản nháp"} ·{" "}
                                            {product.quantity > 0 ? `Còn hàng (${product.quantity})` : "Hết hàng"}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold text-admin-ink">{currency(product.price)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface">
                    <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
                        <h2 className="text-sm font-semibold text-admin-ink">Liên hệ gần đây</h2>
                        <Link href="/admin/contacts" className="flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline">
                            Xem tất cả <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    {recentContacts.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-admin-muted">Chưa có tin nhắn nào.</p>
                    ) : (
                        <ul>
                            {recentContacts.map((contact) => (
                                <li key={contact.id} className="border-b border-admin-border px-5 py-3 last:border-none">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-sm font-medium text-admin-ink">{contact.name}</p>
                                        <span className="shrink-0 text-xs text-admin-muted">{timeAgo(contact.createdAt)}</span>
                                    </div>
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-admin-muted">
                                        {contact.phone ? <Phone size={11} /> : <Mail size={11} />}
                                        {contact.phone || contact.email}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-sm text-admin-muted">{contact.message}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
