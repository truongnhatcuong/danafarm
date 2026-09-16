import { z } from "zod";
import { sendContactEmail } from "@/lib/contact-email";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";

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
  message: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập nội dung liên hệ.")
    .max(5000),
});

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(
      request,
      RATE_LIMIT_POLICIES.contact,
    );
    if (limited) return limited;

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

    await sendContactEmail({
      ...parsed.data,
      phone: parsed.data.phone || undefined,
    });

    return Response.json({ message: "DanaFarm đã nhận thông tin liên hệ." });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Nội dung JSON không hợp lệ." },
        { status: 400 },
      );
    }

    console.error("POST /api/contact failed", error);
    return Response.json(
      { error: "Không thể gửi liên hệ. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
