import Post from "@/components/post";
import { getPostsByDate } from "@/services/post";
import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";

interface IProps {
  params: {
    date: string;
  };
}

export default async function PostsPage({ params }: IProps) {
  const { date } = params;
  const posts = await getPostsByDate(date);

  return (
    <main className="flex-1 overflow-y-auto">
      <section className="w-[36rem]">
        {posts.map((post: IPost) => (
          <Post key={post._id} post={post} />
        ))}

        {!posts.length && (
          <article className="border-t py-6 text-lg">
            <p>
              <strong>Nenhuma notícia encontrada.</strong>
            </p>
          </article>
        )}
      </section>
    </main>
  );
}

export async function generateMetadata({ params }: IProps) {
  return {
    title: `Deschamps News - ${dayjs(params.date).format("DD [de] MMM [de] YYYY")}`,
  };
}
