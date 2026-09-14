import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

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

  if (!product) return { title: "Không tìm thấy sản phẩm | DanaFarm" };

  const description =
    product.shortDescription ?? `Mua ${product.name} chính hãng tại DanaFarm.`;
  const path = `/products/${slug}`;
  const imageUrl = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.name,
      description,
      url: absoluteUrl(path),
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.name,
    image: product.images.map((img) => img.url),
    sku: product.sku || undefined,
    category: primaryCategory?.name,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "VND",
      price: String(product.price),
      availability:
        product.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
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
      <Container className="py-6 md:py-9 bg-white mt-0.5">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[480px_minmax(0,1fr)] xl:gap-10">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-shop-title md:text-[28px]">
              {product.name}
            </h1>
            <div className="my-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-shop-border py-3 text-sm text-shop-text/65">
              <span>
                Tình trạng:{" "}
                <b
                  className={
                    product.quantity > 0 ? "text-green-700" : "text-rose-600"
                  }
                >
                  {product.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                </b>
              </span>
              {product.sku && <span>Mã sản phẩm: {product.sku}</span>}
            </div>
            {product.shortDescription && (
              <p className="mb-5 text-sm leading-7 text-shop-text/80">
                {product.shortDescription}
              </p>
            )}
            <ProductVariantSelector
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                unitLabel: product.unitLabel,
                imageUrl: primaryImage?.url ?? null,
                stock: product.quantity,
              }}
              variants={product.variants}
            />

            <div className="mt-8 grid gap-3 rounded-xl border border-shop-border bg-white p-4 text-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-shop-main" size={22} /> Đảm bảo
                chất lượng sản phẩm
              </div>
              <div className="flex items-center gap-3">
                <Truck className="text-shop-main" size={22} /> Miễn phí vận
                chuyển đơn từ 350.000₫
              </div>
              <div className="flex items-center gap-3">
                <PackageCheck className="text-shop-main" size={22} /> Được mở
                hộp kiểm tra khi nhận hàng
              </div>
            </div>

            {primaryCategory && (
              <p className="mt-5 text-sm text-shop-text/65">
                Danh mục:{" "}
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

        {(product.description ||
          product.usageGuide ||
          product.preservationGuide) && (
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
              <div className="mt-6">
                <h3 className="font-bold text-shop-title">Hướng dẫn sử dụng</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7">
                  {product.usageGuide}
                </p>
              </div>
            )}
            {product.preservationGuide && (
              <div className="mt-6">
                <h3 className="font-bold text-shop-title">
                  Hướng dẫn bảo quản
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7">
                  {product.preservationGuide}
                </p>
              </div>
            )}
          </section>
        )}
      </Container>
    </>
  );
}
