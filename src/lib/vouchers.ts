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

export const VOUCHER_IMAGE_BY_TYPE: Record<VoucherDiscountType, string> = {
    FIXED_AMOUNT: "/voucher/fixedAmout.png",
    PERCENTAGE: "/voucher/precentage.png",
    FREE_SHIPPING: "/voucher/ship.png",
};

export function getVoucherImagePath(type: VoucherDiscountType) {
    return VOUCHER_IMAGE_BY_TYPE[type];
}

export function normalizeVoucherCode(code: string) {
    return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function calculateVoucherDiscount(
    discountType: VoucherDiscountType,
    discountValue: number,
    subtotal: number,
    maxDiscount: number | null,
    shippingFee = 0,
) {
    if (discountType === "FREE_SHIPPING") {
        if (shippingFee <= 0) return 0;
        const shippingDiscountLimit = discountValue > 0 ? discountValue : shippingFee;
        return Math.max(0, Math.min(shippingFee, shippingDiscountLimit));
    }

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
    shippingFee = 0,
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
    if (voucher.discountType === "FREE_SHIPPING" && shippingFee <= 0) {
        return {
            valid: false,
            discount: 0,
            message: "Đơn hàng hiện đã được miễn phí vận chuyển.",
        };
    }

    return {
        valid: true,
        discount: calculateVoucherDiscount(
            voucher.discountType,
            voucher.discountValue,
            subtotal,
            voucher.maxDiscount,
            shippingFee,
        ),
    };
}

export function getVoucherBenefitLabel(voucher: VoucherLike) {
    if (voucher.discountType === "FREE_SHIPPING") {
        return voucher.discountValue > 0
            ? `Giảm tối đa ${voucher.discountValue.toLocaleString("vi-VN")}₫ phí vận chuyển`
            : "Miễn phí vận chuyển";
    }
    if (voucher.discountType === "PERCENTAGE") {
        const maxLabel = voucher.maxDiscount
            ? `, tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}₫`
            : "";
        return `Giảm ${voucher.discountValue}%${maxLabel}`;
    }
    return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}₫`;
}
