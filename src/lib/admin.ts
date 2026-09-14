import "server-only";

import { getAdminUser } from "@/lib/auth";

export const ADMIN_PAGE_SIZE = 10;
export const ADMIN_MAX_PAGE_SIZE = 100;

export type AdminListQuery<TSort extends string> = {
    page: number;
    pageSize: number;
    search: string;
    sort: TSort;
    direction: "asc" | "desc";
    skip: number;
};

export function parseAdminListQuery<TSort extends string>(
    request: Request,
    allowedSorts: readonly TSort[],
    defaultSort: TSort,
): AdminListQuery<TSort> {
    const params = new URL(request.url).searchParams;
    const rawPage = Number(params.get("page"));
    const rawPageSize = Number(params.get("pageSize"));
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize =
        Number.isInteger(rawPageSize) && rawPageSize > 0
            ? Math.min(rawPageSize, ADMIN_MAX_PAGE_SIZE)
            : ADMIN_PAGE_SIZE;
    const requestedSort = params.get("sort") as TSort | null;
    const sort = requestedSort && allowedSorts.includes(requestedSort)
        ? requestedSort
        : defaultSort;
    const direction = params.get("direction") === "asc" ? "asc" : "desc";

    return {
        page,
        pageSize,
        search: params.get("search")?.trim().slice(0, 200) ?? "",
        sort,
        direction,
        skip: (page - 1) * pageSize,
    };
}

export function paginatedResponse<T>(items: T[], total: number, page: number, pageSize: number) {
    return {
        data: items,
        pagination: {
            page,
            pageSize,
            total,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}

export async function authorizeAdminApi() {
    const user = await getAdminUser();
    if (!user) {
        return {
            user: null,
            response: Response.json({ error: "Bạn không có quyền quản trị." }, { status: 403 }),
        } as const;
    }

    return { user, response: null } as const;
}

export function parsePositiveId(value: string) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}
