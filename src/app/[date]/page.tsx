import Post from "@/components/post";
import { getPostsByDate } from "@/services/post";
import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";

interface IProps {
  params: Promise<{ date: string }>;
}

export default async function PostsPage({ params }: IProps) {
  const { date } = await params;
  const posts = await getPostsByDate({ date });

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

export async function generateMetadata({ params }: IProps) {
  const { date } = await params;

  return {
    title: `Deschamps News - ${dayjs(date).format("DD [de] MMM [de] YYYY")}`,
  };
}
