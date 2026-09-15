import { ProductCard } from "./ProductCard";
import type { ProductWithRelations } from "@/types";

export function ProductGrid({
  products,
}: {
  products: ProductWithRelations[];
}) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-shop-text/60">
        Chưa có sản phẩm nào trong danh mục này.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
