export type ProductImage = { url: string; uploadKey?: string | null; alt?: string | null; position: number };

export type ProductVariant = {
    name: string;
    price: number;
    compareAtPrice?: number | null;
    sku?: string | null;
    position: number;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    unitLabel: string | null;
    price: number;
    compareAtPrice: number | null;
    shortDescription: string | null;
    description: string | null;
    usageGuide: string | null;
    preservationGuide: string | null;
    quantity: number;
    status: string;
    isFeatured: boolean;
    isOnSale: boolean;
    isBestSeller: boolean;
    isNew: boolean;
    images: ProductImage[];
    variants: ProductVariant[];
    categories: { id: number; name: string }[];
};

export type Category = { id: number; name: string };

export type ProductMeta = { page: number; pageCount: number; total: number; pageSize: number };

export type ProductFormValues = {
    name: string;
    slug: string;
    sku: string;
    unitLabel: string;
    price: number;
    compareAtPrice: string;
    shortDescription: string;
    description: string;
    usageGuide: string;
    preservationGuide: string;
    quantity: number;
    status: string;
    isFeatured: boolean;
    isOnSale: boolean;
    isBestSeller: boolean;
    isNew: boolean;
    categoryIds: number[];
    images: ProductImage[];
    variants: ProductVariant[];
};

export const emptyProductForm: ProductFormValues = {
    name: "",
    slug: "",
    sku: "",
    unitLabel: "",
    price: 0,
    compareAtPrice: "",
    shortDescription: "",
    description: "",
    usageGuide: "",
    preservationGuide: "",
    quantity: 100,
    status: "active",
    isFeatured: false,
    isOnSale: false,
    isBestSeller: false,
    isNew: false,
    categoryIds: [],
    images: [],
    variants: [],
};

export function productToFormValues(product: Product): ProductFormValues {
    return {
        ...emptyProductForm,
        name: product.name,
        slug: product.slug,
        sku: product.sku ?? "",
        unitLabel: product.unitLabel ?? "",
        price: product.price,
        compareAtPrice: product.compareAtPrice?.toString() ?? "",
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        usageGuide: product.usageGuide ?? "",
        preservationGuide: product.preservationGuide ?? "",
        quantity: product.quantity ?? 0,
        status: product.status,
        isFeatured: product.isFeatured,
        isOnSale: product.isOnSale,
        isBestSeller: product.isBestSeller,
        isNew: product.isNew,
        categoryIds: product.categories.map((c) => c.id),
        images: product.images,
        variants: product.variants,
    };
}

export function formatVnd(value: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
