"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { ProductVariant } from "@/types";

export function ProductVariantSelector({
    basePrice,
    variants,
}: {
    basePrice: number;
    variants: ProductVariant[];
}) {
    const [selected, setSelected] = useState<ProductVariant | null>(
        variants[0] ?? null
    );

    const displayPrice = selected ? selected.price : basePrice;

    return (
        <div>
            <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl md:text-3xl font-bold text-shop-main">
                    {formatCurrency(displayPrice)}
                </span>
                {selected?.compareAtPrice && selected.compareAtPrice > selected.price && (
                    <span className="text-base text-shop-text/50 line-through">
                        {formatCurrency(selected.compareAtPrice)}
                    </span>
                )}
            </div>

            {variants.length > 0 && (
                <div className="mb-5">
                    <p className="text-sm font-medium text-shop-title mb-2">Phân loại</p>
                    <div className="flex flex-wrap gap-2">
                        {variants.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelected(v)}
                                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${selected?.id === v.id
                                        ? "border-shop-main bg-shop-main text-white"
                                        : "border-shop-border text-shop-text hover:border-shop-main"
                                    }`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                    Thêm vào giỏ
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                    Mua ngay
                </Button>
            </div>
        </div>
    );
}
