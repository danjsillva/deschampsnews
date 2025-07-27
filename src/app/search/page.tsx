import Post from "@/components/post";
import { searchPosts } from "@/services/post";
import { IPost } from "@/types/post";

interface IProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: IProps) {
  const { q: query } = await searchParams;
  const posts = query ? await searchPosts({ query }) : [];

  return (
    <section>
      {posts.map((post: IPost) => (
        <Post key={post._id?.toString()} post={post} />
      ))}

      {!posts.length && (
        <article className="border-t py-6 text-lg">
          <p>
            <strong>Nenhuma postagem encontrada.</strong>
          </p>
        </article>
      )}
    </section>
  );
}
