import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode } from "@/lib/vouchers";

export const runtime = "nodejs";

const voucherSchema = z
    .object({
        code: z.string().trim().min(2, "Mã voucher cần ít nhất 2 ký tự.").max(50),
        title: z.string().trim().min(2, "Vui lòng nhập tên chương trình.").max(150),
        description: z.string().trim().max(500).optional().nullable(),
        discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE", "FREE_SHIPPING"]),
        discountValue: z.number().int().nonnegative("Giá trị giảm không được âm."),
        minOrderValue: z.number().int().nonnegative(),
        maxDiscount: z.number().int().positive().optional().nullable(),
        usageLimit: z.number().int().positive().optional().nullable(),
        startsAt: z.coerce.date(),
        expiresAt: z.coerce.date(),
        isActive: z.boolean(),
        showOnHomepage: z.boolean(),
        position: z.number().int().nonnegative(),
    })
    .superRefine((data, context) => {
        if (data.discountType !== "FREE_SHIPPING" && data.discountValue <= 0) {
            context.addIssue({ code: "custom", path: ["discountValue"], message: "Giá trị giảm phải lớn hơn 0." });
        }
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            context.addIssue({ code: "custom", path: ["discountValue"], message: "Phần trăm giảm không được vượt quá 100%." });
        }
        if (data.expiresAt <= data.startsAt) {
            context.addIssue({ code: "custom", path: ["expiresAt"], message: "Ngày hết hạn phải sau ngày bắt đầu." });
        }
    });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID voucher không hợp lệ." }, { status: 400 });

    const parsed = voucherSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu voucher không hợp lệ." }, { status: 400 });
    }

    const data = parsed.data;
    try {
        const voucher = await prisma.voucher.update({
            where: { id },
            data: {
                ...data,
                code: normalizeVoucherCode(data.code),
                description: data.description || null,
                maxDiscount: data.discountType === "PERCENTAGE" ? data.maxDiscount : null,
            },
        });
        return Response.json({ data: voucher });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return Response.json({ error: "Mã voucher đã tồn tại." }, { status: 409 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return Response.json({ error: "Không tìm thấy voucher." }, { status: 404 });
        }
        console.error(`PUT /api/admin/vouchers/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật voucher." }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID voucher không hợp lệ." }, { status: 400 });

    const voucher = await prisma.voucher.findUnique({
        where: { id },
        select: { id: true, usedCount: true, _count: { select: { orders: true, usages: true } } },
    });
    if (!voucher) return Response.json({ error: "Không tìm thấy voucher." }, { status: 404 });

    try {
        if (voucher.usedCount > 0 || voucher._count.orders > 0 || voucher._count.usages > 0) {
            await prisma.voucher.update({
                where: { id },
                data: { isActive: false, showOnHomepage: false },
            });
            return Response.json({ success: true, deactivated: true });
        }

        await prisma.voucher.delete({ where: { id } });
        return Response.json({ success: true, deactivated: false });
    } catch (error) {
        console.error(`DELETE /api/admin/vouchers/${id} failed`, error);
        return Response.json({ error: "Không thể xóa voucher." }, { status: 500 });
    }
}
