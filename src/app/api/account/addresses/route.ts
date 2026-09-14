import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const addressSchema = z.object({
    recipientName: z.string().trim().min(2, "Họ tên người nhận phải có ít nhất 2 ký tự.").max(100),
    phone: z.string().trim().regex(/^[0-9]{9,12}$/, "Số điện thoại không hợp lệ."),
    provinceCode: z.string().min(1, "Vui lòng chọn tỉnh/thành phố."),
    provinceName: z.string().min(1),
    wardCode: z.string().min(1, "Vui lòng chọn phường/xã."),
    wardName: z.string().min(1),
    addressLine: z.string().trim().min(3, "Vui lòng nhập địa chỉ cụ thể.").max(255),
    isDefault: z.boolean().optional().default(false),
});

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return Response.json({ data: addresses });
}

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const parsed = addressSchema.safeParse(await request.json());
    if (!parsed.success) {
        return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const existingCount = await prisma.address.count({ where: { userId: user.id } });
    const shouldBeDefault = parsed.data.isDefault || existingCount === 0;

    const address = await prisma.$transaction(async (tx) => {
        if (shouldBeDefault) {
            await tx.address.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            });
        }
        return tx.address.create({
            data: {
                userId: user.id,
                recipientName: parsed.data.recipientName,
                phone: parsed.data.phone,
                provinceCode: parsed.data.provinceCode,
                provinceName: parsed.data.provinceName,
                wardCode: parsed.data.wardCode,
                wardName: parsed.data.wardName,
                addressLine: parsed.data.addressLine,
                isDefault: shouldBeDefault,
            },
        });
    });

    return Response.json({ data: address }, { status: 201 });
}
