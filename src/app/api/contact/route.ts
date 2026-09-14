import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const contactSchema = z.object({
    name: z.string().trim().min(2, "Vui lòng nhập họ và tên.").max(100),
    email: z.email("Email không hợp lệ.").max(191),
    phone: z
        .string()
        .trim()
        .regex(/^[0-9]{9,12}$/, "Số điện thoại không hợp lệ.")
        .optional()
        .or(z.literal("")),
    message: z.string().trim().min(5, "Vui lòng nhập nội dung liên hệ.").max(5000),
});

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();
        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                {
                    error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
                    issues: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const contact = await prisma.contactMessage.create({
            data: {
                ...parsed.data,
                phone: parsed.data.phone || null,
            },
            select: { id: true, createdAt: true },
        });

        return Response.json(
            { data: contact, message: "DanaFarm đã nhận thông tin liên hệ." },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            return Response.json({ error: "Nội dung JSON không hợp lệ." }, { status: 400 });
        }

        console.error("POST /api/contact failed", error);
        return Response.json(
            { error: "Không thể gửi liên hệ. Vui lòng thử lại sau." },
            { status: 500 },
        );
    }
}
