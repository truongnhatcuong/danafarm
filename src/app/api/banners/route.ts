import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { position: "asc" },
        });

        return Response.json({ data: banners });
    } catch (error) {
        console.error("GET /api/banners failed", error);
        return Response.json(
            { error: "Không thể tải banner." },
            { status: 500 },
        );
    }
}
