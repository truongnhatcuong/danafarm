import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@/types";

export function HomeBanner({ banners }: { banners: Banner[] }) {
    if (banners.length === 0) return null;
    const main = banners[0];

    return (
        <section className="pt-4 md:pt-6">
            <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
                <Link
                    href={main.link ?? "#"}
                    className="block relative w-full aspect-[16/7] md:aspect-[21/7] rounded-xl overflow-hidden bg-shop-bg"
                >
                    <Image
                        src={main.imageUrl}
                        alt={main.title ?? "DanaFarm banner"}
                        fill
                        priority
                        quality={92}
                        sizes="(max-width: 1280px) 100vw, 1280px"
                        className="object-cover"
                    />
                </Link>
            </div>
        </section>
    );
}
