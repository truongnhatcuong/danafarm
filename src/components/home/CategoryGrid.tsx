import { CategoryCard } from "@/components/product/CategoryCard";
import type { Category } from "@/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
    if (categories.length === 0) return null;
    return (
        <section className="py-8 md:py-10">
            <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((c) => (
                        <CategoryCard key={c.id} category={c} />
                    ))}
                </div>
            </div>
        </section>
    );
}
