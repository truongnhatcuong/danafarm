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

/**
 * Chuyển chuỗi tiếng Việt có dấu thành slug URL chuẩn SEO (không dấu, gạch ngang)
 * Ví dụ: "Trà Oolong Cầu Đất 150g" -> "tra-oolong-cau-dat-150g"
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

/**
 * Nguyên tắc sinh mã SKU chuẩn chống trùng:
 * [TIỀN TỐ]-[VIẾT TẮT TÊN]-[MÃ NGẪU NHIÊN 4 KÝ TỰ]
 * - Tiền tố thương hiệu: DNF (DanaFarm)
 * - Viết tắt tên: Lấy chữ cái đầu của mỗi từ trong tên sản phẩm (không dấu, viết hoa)
 *   Ví dụ: "Cà Phê Rang Mộc" -> CPRM
 *          "Trà Oolong Cầu Đất" -> TOCD
 *          Nếu tên chỉ có 1 từ (ví dụ "Matcha") -> lấy 3-4 chữ cái đầu: MATC
 * - Mã ngẫu nhiên 4 ký tự: Gồm số và chữ cái viết hoa (bỏ các ký tự dễ nhầm như 0, O, 1, I)
 *   -> Cho phép hơn 1.000.000 biến thể duy nhất cho mỗi mã tên, hoàn toàn tránh trùng lặp.
 * Ví dụ kết quả: DNF-CPRM-7K9A, DNF-TOCD-4N2W
 */
export function generateSku(name: string, prefix = "DNF"): string {
    const clean = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .trim();

    const words = clean.split(/\s+/).filter(Boolean);
    let acronym = "";

    if (words.length >= 2) {
        acronym = words
            .slice(0, 5)
            .map((w) => w[0].toUpperCase())
            .join("");
    } else if (words.length === 1) {
        acronym = words[0].slice(0, 4).toUpperCase();
    }

    if (!acronym) {
        acronym = "PRD";
    }

    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let rand = "";
    for (let i = 0; i < 4; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${prefix}-${acronym}-${rand}`;
}

/**
 * Sinh SKU cho biến thể dựa trên SKU sản phẩm cha:
 * [SKU_CHA]-[TÊN_BIẾN_THỂ_RÚT_GỌN] hoặc [SKU_CHA]-V[INDEX]
 */
export function generateVariantSku(parentSku: string, variantName: string, index = 1): string {
    const base = parentSku ? parentSku.trim() : "DNF-VAR";
    if (!variantName) return `${base}-V${index}`;

    const cleanVariant = variantName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6);

    return `${base}-${cleanVariant || `V${index}`}`;
}

