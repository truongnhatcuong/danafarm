import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductWithRelations } from "@/types";

export function ProductSection({
    title,
    viewAllHref,
    products,
}: {
    title: string;
    viewAllHref: string;
    products: ProductWithRelations[];
}) {
    if (products.length === 0) return null;

    return (
        <section className="py-8 md:py-10">
            <Container>
                <SectionHeading title={title} viewAllHref={viewAllHref} />
                <ProductGrid products={products} />
            </Container>
        </section>
    );
}
