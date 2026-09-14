import { authorizeAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const categories = await prisma.category.findMany({
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: { id: true, name: true, parentId: true },
    });
    return Response.json({ data: categories });
}
