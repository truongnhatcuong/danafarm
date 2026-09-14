"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type RangeKey = "day" | "week" | "month" | "quarter";

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
    { value: "day", label: "Theo ngày" },
    { value: "week", label: "Theo tuần" },
    { value: "month", label: "Theo tháng" },
    { value: "quarter", label: "Theo quý" },
];

type Point = { label: string; revenue: number; orders: number };

function compactCurrency(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: Point }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
        <div className="rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-admin-ink">{label}</p>
            <p className="mt-1 text-admin-accent">Doanh thu: {formatCurrency(point.revenue)}</p>
            <p className="text-admin-muted">{point.orders} đơn hàng</p>
        </div>
    );
}

export function RevenueChart() {
    const [range, setRange] = useState<RangeKey>("day");
    const [points, setPoints] = useState<Point[]>([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (nextRange: RangeKey) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics/revenue?range=${nextRange}`).then((r) => r.json());
            setPoints(res.data ?? []);
            setSummary(res.summary ?? { totalRevenue: 0, totalOrders: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(range);
    }, [range, load]);

    return (
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-admin-ink">
                        <TrendingUp size={16} className="text-admin-accent" />
                        Doanh thu
                    </h2>
                    <p className="mt-1 text-2xl font-bold text-admin-ink">
                        {formatCurrency(summary.totalRevenue)}
                        {loading && <Loader2 size={16} className="ml-2 inline animate-spin text-admin-muted" />}
                    </p>
                    <p className="text-xs text-admin-muted">{summary.totalOrders} đơn hàng (không tính đơn đã hủy)</p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-full border border-admin-border bg-admin-bg p-1">
                    {RANGE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setRange(option.value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                range === option.value
                                    ? "bg-admin-accent text-white shadow-xs"
                                    : "text-admin-muted hover:text-admin-ink"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5 h-64 w-full">
                {points.every((p) => p.revenue === 0) && !loading ? (
                    <div className="flex h-full items-center justify-center text-sm text-admin-muted">
                        Chưa có doanh thu trong khoảng thời gian này.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-admin-accent)" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="var(--color-admin-accent)" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-admin-border)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "var(--color-admin-muted)" }}
                                axisLine={{ stroke: "var(--color-admin-border)" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "var(--color-admin-muted)" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={compactCurrency}
                                width={48}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-admin-accent)"
                                strokeWidth={2.5}
                                fill="url(#revenueFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
