import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, categories, posts, pages] = await Promise.all([
        prisma.product.findMany({
            where: { status: "active" },
            select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.page.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const staticEntries: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
        { url: absoluteUrl("/collections/all"), changeFrequency: "daily", priority: 0.9 },
        { url: absoluteUrl("/blogs/news"), changeFrequency: "daily", priority: 0.6 },
    ];

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
        url: absoluteUrl(`/collections/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: absoluteUrl(`/blogs/news/${post.slug}`),
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
    }));

    const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
        url: absoluteUrl(`/pages/${page.slug}`),
        lastModified: page.updatedAt,
        changeFrequency: "yearly",
        priority: 0.3,
    }));

    return [...staticEntries, ...productEntries, ...categoryEntries, ...postEntries, ...pageEntries];
}
