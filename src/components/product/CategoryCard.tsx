import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
    return (
        <Link
            href={`/collections/${category.slug}`}
            className="group flex flex-col items-center text-center"
        >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-shop-bg mb-3">
                {category.imageUrl ? (
                    <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) calc(50vw - 24px), (max-width: 1280px) 25vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-shop-text/30 text-2xl font-bold">
                        {category.name.charAt(0)}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-semibold text-shop-title group-hover:text-shop-hover transition-colors">
                {category.name}
            </h3>
            <span className="text-xs text-shop-main mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Xem ngay
            </span>
        </Link>
    );
}
