import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ContentPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
    params,
}: ContentPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
        where: { slug },
        select: { title: true },
    });

    return page
        ? { title: `${page.title} | DanaFarm` }
        : { title: "Không tìm thấy trang | DanaFarm" };
}

export default async function ContentPage({ params }: ContentPageProps) {
    const { slug } = await params;
    const page = await prisma.page.findUnique({ where: { slug } });

    if (!page) notFound();

    return (
        <>
            <Breadcrumb items={[{ label: page.title }]} />
            <Container className="py-8 md:py-12">
                <article className="mx-auto max-w-4xl rounded-2xl border border-shop-border bg-white p-5 shadow-sm md:p-10">
                    <h1 className="mb-6 text-2xl font-bold uppercase text-shop-title md:text-3xl">
                        {page.title}
                    </h1>
                    <div
                        className="content-page space-y-4 text-sm leading-7 text-shop-text/85 [&_a]:text-shop-main [&_a]:underline [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-shop-title [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>
            </Container>
        </>
    );
}
