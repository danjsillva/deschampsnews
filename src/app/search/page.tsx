import Post from "@/components/post";
import { searchPosts } from "@/services/post";
import { IPost } from "@/types/post";

interface IProps {
  searchParams: Promise<{ query?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: IProps) {
  const { query, category } = await searchParams;
  const posts = query || category ? await searchPosts({ query: query || "", category }) : [];

  return (
    <section>
      {posts.map((post: IPost) => (
        <Post key={post._id?.toString()} post={post} />
      ))}

      {!posts.length && (
        <article className="py-6 text-lg">
          <p>
            <strong>Nenhuma postagem encontrada.</strong>
          </p>
        </article>
      )}
    </section>
  );
}
