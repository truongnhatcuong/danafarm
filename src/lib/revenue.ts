import "server-only";

export type RevenueRange = "day" | "week" | "month" | "quarter";

export interface RevenuePoint {
    label: string;
    revenue: number;
    orders: number;
}

const BUCKET_COUNT: Record<RevenueRange, number> = {
    day: 14,
    week: 12,
    month: 12,
    quarter: 8,
};

function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfWeek(date: Date) {
    const d = startOfDay(date);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    return d;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date: Date) {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), quarter * 3, 1);
}

function addPeriod(date: Date, range: RevenueRange, amount: number) {
    const d = new Date(date);
    if (range === "day") d.setDate(d.getDate() + amount);
    else if (range === "week") d.setDate(d.getDate() + amount * 7);
    else if (range === "month") d.setMonth(d.getMonth() + amount);
    else d.setMonth(d.getMonth() + amount * 3);
    return d;
}

function bucketStart(date: Date, range: RevenueRange) {
    if (range === "day") return startOfDay(date);
    if (range === "week") return startOfWeek(date);
    if (range === "month") return startOfMonth(date);
    return startOfQuarter(date);
}

function bucketLabel(date: Date, range: RevenueRange) {
    if (range === "day") return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    if (range === "week") return `Tuần ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
    if (range === "month") return date.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" }).replace("/", "/");
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter}/${date.getFullYear()}`;
}

/** Khoảng thời gian bắt đầu cần truy vấn từ DB để đủ dữ liệu cho `range` đã chọn. */
export function getRangeStart(range: RevenueRange): Date {
    const now = new Date();
    const currentBucket = bucketStart(now, range);
    return addPeriod(currentBucket, range, -(BUCKET_COUNT[range] - 1));
}

/** Gom nhóm danh sách đơn hàng (đã lọc sẵn theo ngày) thành các điểm doanh thu theo `range`. */
export function bucketRevenue(
    orders: { createdAt: Date; total: number }[],
    range: RevenueRange,
): RevenuePoint[] {
    const now = new Date();
    const currentBucket = bucketStart(now, range);
    const count = BUCKET_COUNT[range];

    const buckets = new Map<string, RevenuePoint & { start: Date }>();
    for (let i = count - 1; i >= 0; i--) {
        const start = addPeriod(currentBucket, range, -i);
        const key = start.toISOString();
        buckets.set(key, { label: bucketLabel(start, range), revenue: 0, orders: 0, start });
    }

    const sortedStarts = [...buckets.values()].map((b) => b.start).sort((a, b) => a.getTime() - b.getTime());

    for (const order of orders) {
        const bStart = bucketStart(order.createdAt, range);
        const key = bStart.toISOString();
        const bucket = buckets.get(key);
        if (bucket) {
            bucket.revenue += order.total;
            bucket.orders += 1;
        } else if (bStart.getTime() > sortedStarts[sortedStarts.length - 1]?.getTime()) {
            // Đơn hàng mới hơn bucket hiện tại (race hiếm gặp) — gộp vào bucket cuối.
            const last = buckets.get(sortedStarts[sortedStarts.length - 1].toISOString());
            if (last) {
                last.revenue += order.total;
                last.orders += 1;
            }
        }
    }

    return [...buckets.values()]
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map(({ label, revenue, orders: orderCount }) => ({ label, revenue, orders: orderCount }));
}
