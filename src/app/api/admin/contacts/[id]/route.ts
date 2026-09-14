import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID tin nhắn không hợp lệ." }, { status: 400 });

    try {
        await prisma.contactMessage.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(`DELETE /api/admin/contacts/${id} failed`, error);
        return Response.json({ error: "Không thể xóa tin nhắn." }, { status: 500 });
    }
}
