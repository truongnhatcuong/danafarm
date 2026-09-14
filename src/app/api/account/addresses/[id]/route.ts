import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const updateSchema = z.object({
    isDefault: z.literal(true),
});

async function loadOwnedAddress(userId: number, idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id)) return null;
    return prisma.address.findFirst({ where: { id, userId } });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const { id } = await params;
    const existing = await loadOwnedAddress(user.id, id);
    if (!existing) return Response.json({ error: "Không tìm thấy địa chỉ." }, { status: 404 });

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
        return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    await prisma.$transaction([
        prisma.address.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
        }),
        prisma.address.update({ where: { id: existing.id }, data: { isDefault: true } }),
    ]);

    return Response.json({ data: { ok: true } });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const { id } = await params;
    const existing = await loadOwnedAddress(user.id, id);
    if (!existing) return Response.json({ error: "Không tìm thấy địa chỉ." }, { status: 404 });

    await prisma.address.delete({ where: { id: existing.id } });

    if (existing.isDefault) {
        const nextAddress = await prisma.address.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });
        if (nextAddress) {
            await prisma.address.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
        }
    }

    return Response.json({ data: { ok: true } });
}
