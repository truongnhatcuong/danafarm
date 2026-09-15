import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode, validateVoucherRules } from "@/lib/vouchers";

export const runtime = "nodejs";

const voucherQuerySchema = z.object({
    code: z.string().trim().max(50).optional(),
    subtotal: z.coerce.number().int().nonnegative().default(0),
    shippingFee: z.coerce.number().int().nonnegative().default(0),
});

const publicVoucherSelect = {
    id: true,
    code: true,
    title: true,
    description: true,
    discountType: true,
    discountValue: true,
    minOrderValue: true,
    maxDiscount: true,
    usageLimit: true,
    usedCount: true,
    startsAt: true,
    expiresAt: true,
    isActive: true,
    showOnHomepage: true,
    position: true,
} as const;

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const parsed = voucherQuerySchema.safeParse({
        code: params.get("code") || undefined,
        subtotal: params.get("subtotal") ?? 0,
        shippingFee: params.get("shippingFee") ?? 0,
    });
    if (!parsed.success) {
        return Response.json({ error: "Dữ liệu kiểm tra voucher không hợp lệ." }, { status: 400 });
    }

    const now = new Date();
    const user = await getCurrentUser();
    const code = parsed.data.code ? normalizeVoucherCode(parsed.data.code) : "";

    if (code) {
        const voucher = await prisma.voucher.findUnique({
            where: { code },
            select: publicVoucherSelect,
        });
        if (!voucher) {
            return Response.json({ error: "Mã giảm giá không tồn tại." }, { status: 404 });
        }

        const validation = validateVoucherRules(
            voucher,
            parsed.data.subtotal,
            parsed.data.shippingFee,
            now,
        );
        if (!validation.valid) {
            return Response.json({ error: validation.message }, { status: 400 });
        }

        if (user) {
            const usage = await prisma.voucherUsage.findUnique({
                where: { voucherId_userId: { voucherId: voucher.id, userId: user.id } },
                select: { id: true },
            });
            if (usage) {
                return Response.json({ error: "Bạn đã sử dụng mã giảm giá này." }, { status: 409 });
            }
        }

        return Response.json({ data: voucher, discount: validation.discount });
    }

    const vouchers = await prisma.voucher.findMany({
        where: {
            isActive: true,
            startsAt: { lte: now },
            expiresAt: { gte: now },
        },
        select: publicVoucherSelect,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    const usedVoucherIds = user
        ? new Set(
            (
                await prisma.voucherUsage.findMany({
                    where: { userId: user.id, voucherId: { in: vouchers.map((voucher) => voucher.id) } },
                    select: { voucherId: true },
                })
            ).map((usage) => usage.voucherId),
        )
        : new Set<number>();

    return Response.json({
        data: vouchers
            .filter((voucher) => voucher.usageLimit == null || voucher.usedCount < voucher.usageLimit)
            .map((voucher) => {
                const validation = validateVoucherRules(
                    voucher,
                    parsed.data.subtotal,
                    parsed.data.shippingFee,
                    now,
                );
                return {
                    ...voucher,
                    available: validation.valid && !usedVoucherIds.has(voucher.id),
                    discount: validation.valid ? validation.discount : 0,
                    unavailableReason: usedVoucherIds.has(voucher.id)
                        ? "Bạn đã sử dụng mã này."
                        : validation.valid
                            ? null
                            : validation.message,
                };
            }),
    });
}
