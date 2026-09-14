import { authorizeAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const banners = await prisma.banner.findMany({
        orderBy: { position: "asc" },
    });

    return Response.json({ data: banners });
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body || !body.imageUrl) {
        return Response.json({ error: "Hình ảnh banner là bắt buộc." }, { status: 400 });
    }

    try {
        const banner = await prisma.banner.create({
            data: {
                title: body.title ? String(body.title).trim() : null,
                subtitle: body.subtitle ? String(body.subtitle).trim() : null,
                imageUrl: String(body.imageUrl).trim(),
                imageUploadKey: body.imageUploadKey || null,
                imageMobileUrl: body.imageMobileUrl ? String(body.imageMobileUrl).trim() : null,
                imageMobileUploadKey: body.imageMobileUploadKey || null,
                link: body.link ? String(body.link).trim() : null,
                buttonText: body.buttonText ? String(body.buttonText).trim() : null,
                position: Number(body.position || 0),
                isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
            },
        });
        return Response.json({ data: banner }, { status: 201 });
    } catch (error) {
        console.error("POST /api/admin/banners failed", error);
        return Response.json({ error: "Không thể tạo banner." }, { status: 500 });
    }
}
