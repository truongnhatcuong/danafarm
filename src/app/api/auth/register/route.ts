import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
    name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự.").max(100),
    email: z.email("Email không hợp lệ.").max(191).transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^[0-9]{9,12}$/, "Số điện thoại không hợp lệ.").optional().or(z.literal("")),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự.").max(128),
});

export async function POST(request: Request) {
    try {
        const parsed = registerSchema.safeParse(await request.json());
        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                phone: parsed.data.phone || null,
                passwordHash: await hashPassword(parsed.data.password),
            },
            select: { id: true, name: true, email: true, phone: true },
        });
        await createSession(user.id);
        return Response.json({ data: user }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return Response.json({ error: "Email này đã được đăng ký." }, { status: 409 });
        }
        console.error("POST /api/auth/register failed", error);
        return Response.json({ error: "Không thể đăng ký tài khoản." }, { status: 500 });
    }
}
