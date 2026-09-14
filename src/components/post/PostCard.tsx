import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
    const date = new Date(post.publishedAt).toLocaleDateString("vi-VN");

    return (
        <article className="group bg-white rounded-xl border border-shop-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link href={`/blogs/news/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-shop-bg">
                {post.coverImageUrl ? (
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 410px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-shop-text/30">
                        DanaFarm
                    </div>
                )}
            </Link>
            <div className="p-4">
                <p className="text-xs text-shop-main font-medium mb-1">Tin tức · {date}</p>
                <h3 className="font-semibold text-shop-title line-clamp-2 min-h-[3em]">
                    <Link href={`/blogs/news/${post.slug}`} className="hover:text-shop-hover transition-colors">
                        {post.title}
                    </Link>
                </h3>
                {post.excerpt && (
                    <p className="text-sm text-shop-text/70 mt-2 line-clamp-2">{post.excerpt}</p>
                )}
            </div>
        </article>
    );
}
