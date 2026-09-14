import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID người dùng không hợp lệ." }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body || !body.role) {
        return Response.json({ error: "Vai trò là bắt buộc." }, { status: 400 });
    }

    if (body.role !== "CUSTOMER" && body.role !== "ADMIN") {
        return Response.json({ error: "Vai trò không hợp lệ." }, { status: 400 });
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { role: body.role },
            select: { id: true, name: true, email: true, role: true },
        });
        return Response.json({ data: user });
    } catch (error) {
        console.error(`PUT /api/admin/users/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật người dùng." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID người dùng không hợp lệ." }, { status: 400 });

    // Không cho phép admin tự xóa chính mình
    if (auth.user?.id === id) {
        return Response.json({ error: "Không thể xóa tài khoản của chính bạn." }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(`DELETE /api/admin/users/${id} failed`, error);
        return Response.json({ error: "Không thể xóa người dùng." }, { status: 500 });
    }
}
