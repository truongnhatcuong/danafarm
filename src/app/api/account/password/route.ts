import { z } from "zod";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.").max(128),
});

export async function PATCH(request: Request) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const parsed = passwordSchema.safeParse(await request.json());
    if (!parsed.success) {
        return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
    });
    if (!record) return Response.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });

    const isValid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
    if (!isValid) {
        return Response.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });

    return Response.json({ data: { ok: true } });
}
