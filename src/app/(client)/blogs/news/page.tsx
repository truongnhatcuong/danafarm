import type { Metadata } from "next";
import { PostCard } from "@/components/post/PostCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tin tức | DanaFarm",
    description: "Câu chuyện về trà, cà phê, matcha và đặc sản Đà Lạt từ DanaFarm.",
};

export default async function NewsPage() {
    const posts = await prisma.post.findMany({
        orderBy: { publishedAt: "desc" },
    });

    return (
        <>
            <Breadcrumb items={[{ label: "Tin tức" }]} />
            <Container className="py-8 md:py-12">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-bold uppercase text-shop-title md:text-3xl">
                        Tin Tức DanaFarm
                    </h1>
                    <p className="mt-3 text-sm text-shop-text/65">
                        Khám phá kiến thức, công thức và câu chuyện từ vùng đất Đà Lạt.
                    </p>
                </header>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {posts.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
            </Container>
        </>
    );
}
