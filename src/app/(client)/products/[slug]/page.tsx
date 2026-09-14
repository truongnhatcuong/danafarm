import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
    params,
}: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { name: true, shortDescription: true, images: { take: 1 } },
    });

    return product
        ? {
            title: `${product.name} | DanaFarm`,
            description:
                product.shortDescription ?? `Mua ${product.name} chính hãng tại DanaFarm.`,
            openGraph: { images: product.images[0]?.url ? [product.images[0].url] : [] },
        }
        : { title: "Không tìm thấy sản phẩm | DanaFarm" };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            images: { orderBy: { position: "asc" } },
            variants: { orderBy: { position: "asc" } },
            categories: { orderBy: { position: "asc" } },
        },
    });

    if (!product || product.status !== "active") notFound();

    const primaryCategory = product.categories[0];
    const primaryImage = product.images[0];

    return (
        <>
            <Breadcrumb
                items={[
                    ...(primaryCategory
                        ? [
                            {
                                label: primaryCategory.name,
                                href: `/collections/${primaryCategory.slug}`,
                            },
                        ]
                        : []),
                    { label: product.name },
                ]}
            />
            <Container className="py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-shop-border bg-white">
                            {primaryImage ? (
                                <Image
                                    src={primaryImage.url}
                                    alt={primaryImage.alt ?? product.name}
                                    fill
                                    priority
                                    quality={95}
                                    sizes="(max-width: 1024px) calc(100vw - 32px), 610px"
                                    className="object-contain p-4"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-shop-text/40">
                                    Không có ảnh
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="mt-4 grid grid-cols-5 gap-3">
                                {product.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative aspect-square overflow-hidden rounded-lg border border-shop-border bg-white"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.alt ?? product.name}
                                            fill
                                            quality={90}
                                            sizes="120px"
                                            className="object-contain p-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold leading-tight text-shop-title md:text-3xl">
                            {product.name}
                        </h1>
                        <div className="my-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-shop-border py-3 text-sm text-shop-text/65">
                            <span>Tình trạng: <b className="text-green-700">Còn hàng</b></span>
                            {product.sku && <span>Mã sản phẩm: {product.sku}</span>}
                        </div>
                        {product.shortDescription && (
                            <p className="mb-5 text-sm leading-7 text-shop-text/80">
                                {product.shortDescription}
                            </p>
                        )}
                        <ProductVariantSelector
                            basePrice={product.price}
                            variants={product.variants}
                        />

                        <div className="mt-8 grid gap-3 rounded-xl border border-shop-border bg-white p-4 text-sm">
                            <div className="flex items-center gap-3"><ShieldCheck className="text-shop-main" size={22} /> Đảm bảo chất lượng sản phẩm</div>
                            <div className="flex items-center gap-3"><Truck className="text-shop-main" size={22} /> Miễn phí vận chuyển đơn từ 350.000₫</div>
                            <div className="flex items-center gap-3"><PackageCheck className="text-shop-main" size={22} /> Được mở hộp kiểm tra khi nhận hàng</div>
                        </div>

                        {primaryCategory && (
                            <p className="mt-5 text-sm text-shop-text/65">
                                Danh mục: {" "}
                                <Link
                                    href={`/collections/${primaryCategory.slug}`}
                                    className="font-semibold text-shop-main hover:underline"
                                >
                                    {primaryCategory.name}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>

                {(product.description || product.usageGuide || product.preservationGuide) && (
                    <section className="mt-12 rounded-2xl border border-shop-border bg-white p-5 md:p-8">
                        <h2 className="mb-5 text-xl font-bold uppercase text-shop-title">
                            Thông tin sản phẩm
                        </h2>
                        {product.description && (
                            <div
                                className="prose prose-sm max-w-none leading-7 text-shop-text/80"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        )}
                        {product.usageGuide && (
                            <div className="mt-6"><h3 className="font-bold text-shop-title">Hướng dẫn sử dụng</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{product.usageGuide}</p></div>
                        )}
                        {product.preservationGuide && (
                            <div className="mt-6"><h3 className="font-bold text-shop-title">Hướng dẫn bảo quản</h3><p className="mt-2 whitespace-pre-line text-sm leading-7">{product.preservationGuide}</p></div>
                        )}
                    </section>
                )}
            </Container>
        </>
    );
}
