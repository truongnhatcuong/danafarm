import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/post/PostCard";
import type { Post } from "@/types";

export function PostSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-8 md:py-10 ">
      <Container>
        <SectionHeading title="Bài Viết Mới Nhất" viewAllHref="/blogs/news" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4  gap-5 2xl:gap-6 ">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
