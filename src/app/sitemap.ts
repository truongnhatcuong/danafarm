import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

type SitemapQueryName = "products" | "categories" | "posts" | "pages";

const STATIC_ENTRIES: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/collections/all"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/blogs/news"), changeFrequency: "daily", priority: 0.6 },
];

const SITEMAP_QUERY_MAX_ATTEMPTS = 2;
const SITEMAP_QUERY_RETRY_DELAY_MS = 300;

function getErrorDetails(error: unknown) {
    const prismaError = error as {
        name?: string;
        message?: string;
        code?: string;
        clientVersion?: string;
        meta?: unknown;
    };

    return {
        name: prismaError?.name ?? "UnknownError",
        message: prismaError?.message ?? String(error),
        code: prismaError?.code ?? null,
        clientVersion: prismaError?.clientVersion ?? null,
        meta: prismaError?.meta ?? null,
    };
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function runSitemapQuery<T>(name: SitemapQueryName, createQuery: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    let lastError: unknown;

    for (let attempt = 1; attempt <= SITEMAP_QUERY_MAX_ATTEMPTS; attempt += 1) {
        console.info(`[sitemap] ${name} query started`, { attempt });

        try {
            const result = await createQuery();
            const count = Array.isArray(result) ? result.length : null;
            console.info(`[sitemap] ${name} query succeeded`, {
                attempt,
                durationMs: Date.now() - startedAt,
                count,
            });
            return result;
        } catch (error) {
            lastError = error;
            const willRetry = attempt < SITEMAP_QUERY_MAX_ATTEMPTS;
            console.error(`[sitemap] ${name} query failed`, {
                attempt,
                willRetry,
                durationMs: Date.now() - startedAt,
                ...getErrorDetails(error),
            });

            if (willRetry) await wait(SITEMAP_QUERY_RETRY_DELAY_MS);
        }
    }

    throw lastError;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const startedAt = Date.now();
    console.info("[sitemap] generation started");

    try {
        const [products, categories, posts, pages] = await Promise.all([
            runSitemapQuery("products", () =>
                prisma.product.findMany({
                    where: { status: "active" },
                    select: { slug: true, updatedAt: true },
                }),
            ),
            runSitemapQuery("categories", () =>
                prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
            ),
            runSitemapQuery("posts", () =>
                prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
            ),
            runSitemapQuery("pages", () =>
                prisma.page.findMany({ select: { slug: true, updatedAt: true } }),
            ),
        ]);

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

        const entries = [...STATIC_ENTRIES, ...productEntries, ...categoryEntries, ...postEntries, ...pageEntries];
        console.info("[sitemap] generation succeeded", {
            durationMs: Date.now() - startedAt,
            count: entries.length,
        });
        return entries;
    } catch (error) {
        console.error("[sitemap] generation failed; returning static fallback", {
            durationMs: Date.now() - startedAt,
            fallbackCount: STATIC_ENTRIES.length,
            ...getErrorDetails(error),
        });
        return STATIC_ENTRIES;
    }
}
