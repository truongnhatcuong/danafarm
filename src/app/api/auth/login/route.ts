import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
    email: z.email("Email không hợp lệ.").transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(128),
});

export async function POST(request: Request) {
    try {
        const parsed = loginSchema.safeParse(await request.json());
        if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
            return Response.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 });
        }

        await createSession(user.id);
        return Response.json({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("POST /api/auth/login failed", error);
        return Response.json({ error: "Không thể đăng nhập." }, { status: 500 });
    }
}
