"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryImage {
  id: number;
  url: string;
  alt: string | null;
}

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductGalleryImage[];
  productName: string;
}) {
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? null);
  const selectedImage =
    images.find((image) => image.id === selectedId) ?? images[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-[480px] lg:mx-0">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-shop-border bg-white">
        {selectedImage ? (
          <Image
            key={selectedImage.id}
            src={selectedImage.url}
            alt={selectedImage.alt ?? productName}
            fill
            priority
            quality={95}
            sizes="(max-width: 1024px) calc(100vw - 32px), 480px"
            className="object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-shop-text/40">
            Không có ảnh
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          role="list"
          aria-label="Ảnh sản phẩm"
        >
          {images.map((image, index) => {
            const active = image.id === selectedImage?.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedId(image.id)}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition-colors md:w-[72px] ${
                  active
                    ? "border-shop-main"
                    : "border-shop-border hover:border-shop-main/60"
                }`}
                aria-label={`Xem ảnh ${index + 1} của ${productName}`}
                aria-pressed={active}
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? `${productName} - ảnh ${index + 1}`}
                  fill
                  quality={90}
                  sizes="72px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
