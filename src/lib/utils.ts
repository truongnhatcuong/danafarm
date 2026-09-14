import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as Vietnamese Dong currency, matching the original
 * site's display style, e.g. 240000 -> "240.000₫"
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return "";
    return `${amount.toLocaleString("vi-VN")}₫`;
}

/**
 * Compute discount percentage between compareAtPrice and price.
 */
export function discountPercent(
    price: number,
    compareAtPrice?: number | null
): number | null {
    if (!compareAtPrice || compareAtPrice <= price) return null;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function truncate(text: string, length = 120): string {
    if (text.length <= length) return text;
    return `${text.slice(0, length).trim()}…`;
}
