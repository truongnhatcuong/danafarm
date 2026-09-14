import Link from "next/link";
import Image from "next/image";
import { formatCurrency, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { ProductWithRelations } from "@/types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
    const image = product.images[0];
    const discount = discountPercent(product.price, product.compareAtPrice);

    return (
        <div className="group relative bg-white rounded-xl border border-shop-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link
                href={`/products/${product.slug}`}
                className="block relative aspect-square overflow-hidden bg-shop-bg"
            >
                {image ? (
                    <Image
                        src={image.url}
                        alt={image.alt ?? product.name}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) calc(50vw - 24px), (max-width: 1024px) 30vw, (max-width: 1280px) 23vw, 240px"
                        className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-shop-text/40 text-sm">
                        Không có ảnh
                    </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && <Badge tone="new">Mới</Badge>}
                    {discount && <Badge tone="sale">-{discount}%</Badge>}
                    {product.isBestSeller && <Badge tone="bestseller">Bán chạy</Badge>}
                </div>
            </Link>

            <div className="p-3 md:p-4">
                <h3 className="text-sm font-medium text-shop-title line-clamp-2 min-h-[2.5em]">
                    <Link href={`/products/${product.slug}`} className="hover:text-shop-hover transition-colors">
                        {product.name}
                    </Link>
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-shop-main font-bold">{formatCurrency(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs text-shop-text/50 line-through">
                            {formatCurrency(product.compareAtPrice)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
