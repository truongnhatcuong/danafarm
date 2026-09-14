import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types";

import { cn } from "@/lib/utils";

export function PostCard({
    post,
    className,
}: {
    post: Post;
    className?: string;
}) {
    const date = new Date(post.publishedAt).toLocaleDateString("vi-VN");

    return (
        <article
            className={cn(
                "group bg-white rounded-xl border border-shop-border overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full 2xl:max-w-[360px] 2xl:mx-auto flex flex-col",
                className
            )}
        >
            <Link
                href={`/blogs/news/${post.slug}`}
                className="block relative aspect-[16/10] 2xl:aspect-[16/9] overflow-hidden bg-shop-bg shrink-0"
            >
                {post.coverImageUrl ? (
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 360px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-shop-text/30">
                        DanaFarm
                    </div>
                )}
            </Link>
            <div className="p-4 2xl:p-3.5 flex flex-col flex-1">
                <p className="text-xs text-shop-main font-medium mb-1">Tin tức · {date}</p>
                <h3 className="font-semibold text-sm 2xl:text-[13.5px] text-shop-title line-clamp-2 min-h-[2.6em] leading-snug">
                    <Link href={`/blogs/news/${post.slug}`} className="hover:text-shop-hover transition-colors">
                        {post.title}
                    </Link>
                </h3>
                {post.excerpt && (
                    <p className="text-xs 2xl:text-xs text-shop-text/70 mt-1.5 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}
            </div>
        </article>
    );
}
