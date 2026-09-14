/**
 * Domain thật khi lên production — đặt qua biến môi trường NEXT_PUBLIC_SITE_URL.
 * Dùng cho metadataBase, canonical URL, sitemap.xml, robots.txt và JSON-LD.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://danafarm.vn").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
