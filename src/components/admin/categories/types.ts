export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageUploadKey: string | null;
    position: number;
    parentId: number | null;
    parent?: { id: number; name: string } | null;
    _count?: { products: number; children: number };
};

export type CategoryMeta = { page: number; pageSize: number; total: number; pageCount: number };

export type CategoryFormValues = {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    imageUploadKey: string;
    position: number;
    parentId: string;
};

export const emptyCategoryForm: CategoryFormValues = {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    imageUploadKey: "",
    position: 0,
    parentId: "",
};
