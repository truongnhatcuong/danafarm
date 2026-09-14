import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const nullableNonNegativeInt = z.number().int().nonnegative().nullable().optional();

export const imageSchema = z.object({
    url: z.string().trim().url().max(2048),
    uploadKey: z.string().trim().min(1).max(1024).nullable().optional(),
    alt: optionalText(255),
    position: z.number().int().nonnegative().default(0),
});

export const variantSchema = z.object({
    name: z.string().trim().min(1, "Tên biến thể là bắt buộc.").max(255),
    price: z.number().int().nonnegative(),
    compareAtPrice: nullableNonNegativeInt,
    sku: optionalText(100),
    position: z.number().int().nonnegative().default(0),
});

export const categoryInputSchema = z.object({
    name: z.string().trim().min(1, "Tên danh mục là bắt buộc.").max(255),
    slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
    description: optionalText(10000),
    imageUrl: z.string().trim().url().max(2048).nullable().optional(),
    imageUploadKey: z.string().trim().min(1).max(1024).nullable().optional(),
    position: z.number().int().nonnegative().default(0),
    parentId: z.number().int().positive().nullable().optional(),
});

export const productInputSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc.").max(255),
    slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
    sku: optionalText(100),
    unitLabel: optionalText(100),
    price: z.number().int().nonnegative(),
    compareAtPrice: nullableNonNegativeInt,
    shortDescription: optionalText(10000),
    description: optionalText(100000),
    usageGuide: optionalText(10000),
    preservationGuide: optionalText(10000),
    stockStatus: z.enum(["in_stock", "out_of_stock"]),
    status: z.enum(["active", "draft"]),
    isFeatured: z.boolean().default(false),
    isOnSale: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isNew: z.boolean().default(false),
    categoryIds: z.array(z.number().int().positive()).max(100).default([]).transform((ids) => [...new Set(ids)]),
    images: z.array(imageSchema).max(20).default([]),
    variants: z.array(variantSchema).max(100).default([]),
});

export function validationError(error: z.ZodError) {
    return Response.json(
        { error: "Dữ liệu không hợp lệ.", issues: z.flattenError(error).fieldErrors },
        { status: 400 },
    );
}

export function nullable<T>(value: T | null | undefined): T | null {
    return value ?? null;
}
