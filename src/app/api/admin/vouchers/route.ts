import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authorizeAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode } from "@/lib/vouchers";

export const runtime = "nodejs";

const voucherSchema = z
    .object({
        code: z.string().trim().min(2, "Mã voucher cần ít nhất 2 ký tự.").max(50),
        title: z.string().trim().min(2, "Vui lòng nhập tên chương trình.").max(150),
        description: z.string().trim().max(500).optional().nullable(),
        discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
        discountValue: z.number().int().positive("Giá trị giảm phải lớn hơn 0."),
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
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            context.addIssue({
                code: "custom",
                path: ["discountValue"],
                message: "Phần trăm giảm không được vượt quá 100%.",
            });
        }
        if (data.expiresAt <= data.startsAt) {
            context.addIssue({
                code: "custom",
                path: ["expiresAt"],
                message: "Ngày hết hạn phải sau ngày bắt đầu.",
            });
        }
    });

export async function GET() {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const vouchers = await prisma.voucher.findMany({
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        include: { _count: { select: { usages: true, orders: true } } },
    });
    return Response.json({ data: vouchers });
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const parsed = voucherSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Dữ liệu voucher không hợp lệ." },
            { status: 400 },
        );
    }

    const data = parsed.data;
    try {
        const voucher = await prisma.voucher.create({
            data: {
                ...data,
                code: normalizeVoucherCode(data.code),
                description: data.description || null,
                maxDiscount: data.discountType === "PERCENTAGE" ? data.maxDiscount : null,
            },
        });
        return Response.json({ data: voucher }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return Response.json({ error: "Mã voucher đã tồn tại." }, { status: 409 });
        }
        console.error("POST /api/admin/vouchers failed", error);
        return Response.json({ error: "Không thể tạo voucher." }, { status: 500 });
    }
}

