import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    return Response.json({ data: user });
}
