import type {
    Category as PrismaCategory,
    Product as PrismaProduct,
    ProductImage,
    ProductVariant,
    Post as PrismaPost,
    Banner,
    Page,
    SiteSetting,
} from "@prisma/client";

export type Category = PrismaCategory & {
    children?: Category[];
    _count?: { products: number };
};

export type ProductWithRelations = PrismaProduct & {
    images: ProductImage[];
    variants: ProductVariant[];
    categories: PrismaCategory[];
};

export type Post = PrismaPost;

export type { Banner, Page, SiteSetting, ProductImage, ProductVariant };

export interface NavSubItem {
    label: string;
    slug: string;
}

export interface NavItem {
    label: string;
    slug: string;
    children?: NavSubItem[];
}
