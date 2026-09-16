import Link from "next/link";
import {
    ArrowUpRight,
    FileText,
    LayoutGrid,
    Minus,
    Newspaper,
    Package,
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
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1_000;

type DashboardPeriod = "today" | "week" | "month" | "quarter" | "year" | "all";

type PeriodBounds = {
    currentStart: Date | null;
    previousStart: Date;
    previousEnd: Date;
};

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string; cardLabel: string }[] = [
    { value: "today", label: "Hôm nay", cardLabel: "hôm nay" },
    { value: "week", label: "Tuần này", cardLabel: "tuần này" },
    { value: "month", label: "Tháng này", cardLabel: "tháng này" },
    { value: "quarter", label: "Quý này", cardLabel: "quý này" },
    { value: "year", label: "Năm nay", cardLabel: "năm nay" },
    { value: "all", label: "Tổng cộng", cardLabel: "tổng cộng" },
];

function getPeriodBounds(period: DashboardPeriod, now = new Date()): PeriodBounds {
    const vietnamNow = new Date(now.getTime() + VIETNAM_OFFSET_MS);
    const year = vietnamNow.getUTCFullYear();
    const month = vietnamNow.getUTCMonth();
    const day = vietnamNow.getUTCDate();
    const daysSinceMonday = (vietnamNow.getUTCDay() + 6) % 7;
    const toUtc = (date: Date) => new Date(date.getTime() - VIETNAM_OFFSET_MS);

    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === "today") {
        currentStart = toUtc(new Date(Date.UTC(year, month, day)));
        previousStart = new Date(currentStart.getTime() - DAY_MS);
        previousEnd = currentStart;
    } else if (period === "week") {
        currentStart = toUtc(new Date(Date.UTC(year, month, day - daysSinceMonday)));
        previousStart = new Date(currentStart.getTime() - 7 * DAY_MS);
        previousEnd = currentStart;
    } else if (period === "month") {
        currentStart = toUtc(new Date(Date.UTC(year, month, 1)));
        previousStart = toUtc(new Date(Date.UTC(year, month - 1, 1)));
        previousEnd = currentStart;
    } else if (period === "quarter") {
        const quarterStartMonth = Math.floor(month / 3) * 3;
        currentStart = toUtc(new Date(Date.UTC(year, quarterStartMonth, 1)));
        previousStart = toUtc(new Date(Date.UTC(year, quarterStartMonth - 3, 1)));
        previousEnd = currentStart;
    } else if (period === "year") {
        currentStart = toUtc(new Date(Date.UTC(year, 0, 1)));
        previousStart = toUtc(new Date(Date.UTC(year - 1, 0, 1)));
        previousEnd = currentStart;
    } else {
        const start30 = new Date(now.getTime() - 30 * DAY_MS);
        return {
            currentStart: null,
            previousStart: new Date(start30.getTime() - 30 * DAY_MS),
            previousEnd: start30,
        };
    }

    return { currentStart, previousStart, previousEnd };
}

async function countForPeriod(
    model: { count: (args?: { where?: { createdAt?: { gte?: Date; lt?: Date } } }) => Promise<number> },
    bounds: PeriodBounds,
) {
    const currentWhere = bounds.currentStart
        ? { createdAt: { gte: bounds.currentStart } }
        : { createdAt: { gte: bounds.previousEnd } };
    const [total, current, previous] = await Promise.all([
        model.count(),
        model.count({ where: currentWhere }),
        model.count({ where: { createdAt: { gte: bounds.previousStart, lt: bounds.previousEnd } } }),
    ]);
    return { total: bounds.currentStart ? current : total, current, previous };
}

async function revenueForPeriod(bounds: PeriodBounds) {
    const baseWhere = { status: { not: "CANCELLED" as const } };
    const currentWhere = {
        ...baseWhere,
        createdAt: { gte: bounds.currentStart ?? bounds.previousEnd },
    };
    const [totalAgg, currentAgg, previousAgg] = await Promise.all([
        prisma.order.aggregate({ _sum: { total: true }, where: baseWhere }),
        prisma.order.aggregate({ _sum: { total: true }, where: currentWhere }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: { ...baseWhere, createdAt: { gte: bounds.previousStart, lt: bounds.previousEnd } },
        }),
    ]);
    const total = totalAgg._sum.total ?? 0;
    const current = currentAgg._sum.total ?? 0;
    return { total: bounds.currentStart ? current : total, current, previous: previousAgg._sum.total ?? 0 };
}

function trendBadge(
    { current, previous }: { current: number; previous: number },
    period: DashboardPeriod,
) {
    const comparison = period === "all" ? "30 ngày gần đây" : "kỳ trước";
    if (previous === 0) {
        if (current === 0) return { label: "Chưa có dữ liệu", tone: "flat" as const };
        return { label: period === "all" ? "Có phát sinh trong 30 ngày" : "Mới trong kỳ này", tone: "up" as const };
    }
    const percent = Math.round(((current - previous) / previous) * 100);
    if (percent === 0) return { label: `Không đổi so với ${comparison}`, tone: "flat" as const };
    return {
        label: `${percent > 0 ? "+" : ""}${percent}% so với ${comparison}`,
        tone: percent > 0 ? ("up" as const) : ("down" as const),
    };
}

const toneStyles = {
    up: { icon: TrendingUp, className: "text-emerald-600 bg-emerald-50" },
    down: { icon: TrendingDown, className: "text-rose-600 bg-rose-50" },
    flat: { icon: Minus, className: "text-admin-muted bg-admin-bg" },
};

const currency = (value: number) => `${value.toLocaleString("vi-VN")}₫`;

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

type DashboardPageProps = {
    searchParams: Promise<{ period?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
    const query = await searchParams;
    const period: DashboardPeriod = PERIOD_OPTIONS.some((option) => option.value === query.period)
        ? (query.period as DashboardPeriod)
        : "today";
    const bounds = getPeriodBounds(period);
    const periodOption = PERIOD_OPTIONS.find((option) => option.value === period) ?? PERIOD_OPTIONS[0];

    const [
        productStats,
        categoryStats,
        postStats,
        userStats,
        orderStats,
        revenueStats,
        recentProducts,
        recentOrders,
    ] = await Promise.all([
        countForPeriod(prisma.product, bounds),
        countForPeriod(prisma.category, bounds),
        countForPeriod(prisma.post, bounds),
        countForPeriod({
            count: (args?: { where?: { createdAt?: { gte?: Date; lt?: Date } } }) =>
                prisma.user.count({ ...args, where: { ...args?.where, role: "CUSTOMER" } }),
        }, bounds),
        countForPeriod(prisma.order, bounds),
        revenueForPeriod(bounds),
        prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, slug: true, price: true, status: true, quantity: true },
        }),
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
    ];

    const quickActions = [
        { label: "Xem đơn hàng", description: "Xử lý và cập nhật trạng thái đơn", href: "/admin/orders", icon: Receipt },
        { label: "Thêm sản phẩm", description: "Tạo sản phẩm mới cho cửa hàng", href: "/admin/products", icon: Package },
        { label: "Thêm danh mục", description: "Sắp xếp lại nhóm sản phẩm", href: "/admin/categories", icon: LayoutGrid },
        { label: "Viết bài mới", description: "Đăng tin tức hoặc bài viết", href: "/admin/posts", icon: FileText },
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Tổng quan hệ thống</h1>
                    <p className="mt-1 text-sm text-admin-muted">
                        Theo dõi hoạt động DanaFarm · Số liệu {periodOption.cardLabel}
                    </p>
                </div>
                <nav
                    aria-label="Chọn khoảng thời gian thống kê"
                    className="flex flex-wrap gap-1 rounded-xl border border-admin-border bg-admin-surface p-1 shadow-xs"
                >
                    {PERIOD_OPTIONS.map((option) => (
                        <Link
                            key={option.value}
                            href={option.value === "today" ? "/admin" : `/admin?period=${option.value}`}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${period === option.value
                                ? "bg-admin-accent text-white shadow-xs"
                                : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
                                }`}
                        >
                            {option.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                {kpis.slice(0, 2).map(({ label, icon: Icon, stats, isCurrency }) => {
                    const badge = trendBadge(stats, period);
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
                            <p className="mt-1 text-sm text-admin-muted">
                                {label} ({periodOption.cardLabel})
                            </p>
                        </article>
                    );
                })}
            </section>

            <RevenueChart />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.slice(2).map(({ label, icon: Icon, stats }) => {
                    const badge = trendBadge(stats, period);
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
                            <p className="mt-1 text-sm text-admin-muted">
                                {label} ({periodOption.cardLabel})
                            </p>
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

            <section className="grid gap-5 grid-cols-1 xl:grid-cols-2">
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

            </section>
        </div>
    );
}
