import type { Voucher, VoucherDiscountType } from "@prisma/client";

export type VoucherLike = Pick<
    Voucher,
    | "id"
    | "code"
    | "title"
    | "description"
    | "discountType"
    | "discountValue"
    | "minOrderValue"
    | "maxDiscount"
    | "usageLimit"
    | "usedCount"
    | "startsAt"
    | "expiresAt"
    | "isActive"
    | "showOnHomepage"
    | "position"
>;

export type VoucherValidation =
    | { valid: true; discount: number }
    | { valid: false; discount: 0; message: string };

export function normalizeVoucherCode(code: string) {
    return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function calculateVoucherDiscount(
    discountType: VoucherDiscountType,
    discountValue: number,
    subtotal: number,
    maxDiscount: number | null,
) {
    if (subtotal <= 0 || discountValue <= 0) return 0;

    const rawDiscount =
        discountType === "PERCENTAGE"
            ? Math.floor((subtotal * discountValue) / 100)
            : discountValue;
    const cappedDiscount = maxDiscount == null
        ? rawDiscount
        : Math.min(rawDiscount, maxDiscount);

    return Math.max(0, Math.min(subtotal, cappedDiscount));
}

export function validateVoucherRules(
    voucher: VoucherLike,
    subtotal: number,
    now = new Date(),
): VoucherValidation {
    if (!voucher.isActive) {
        return { valid: false, discount: 0, message: "Mã giảm giá đang tạm ngưng." };
    }
    if (voucher.startsAt > now) {
        return { valid: false, discount: 0, message: "Mã giảm giá chưa đến thời gian sử dụng." };
    }
    if (voucher.expiresAt < now) {
        return { valid: false, discount: 0, message: "Mã giảm giá đã hết hạn." };
    }
    if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
        return { valid: false, discount: 0, message: "Mã giảm giá đã hết lượt sử dụng." };
    }
    if (subtotal < voucher.minOrderValue) {
        return {
            valid: false,
            discount: 0,
            message: `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}₫.`,
        };
    }

    return {
        valid: true,
        discount: calculateVoucherDiscount(
            voucher.discountType,
            voucher.discountValue,
            subtotal,
            voucher.maxDiscount,
        ),
    };
}

export function getVoucherBenefitLabel(voucher: VoucherLike) {
    if (voucher.discountType === "PERCENTAGE") {
        const maxLabel = voucher.maxDiscount
            ? `, tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}₫`
            : "";
        return `Giảm ${voucher.discountValue}%${maxLabel}`;
    }
    return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}₫`;
}
