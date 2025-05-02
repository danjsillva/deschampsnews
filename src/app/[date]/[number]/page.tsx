import Post from "@/components/post";
import { getPostByDateAndNumber } from "@/services/post";
import dayjs from "@/utils/dayjs";

interface IProps {
  params: Promise<{ date: string; number: string }>;
}

export default async function PostPage({ params }: IProps) {
  const { date, number } = await params;
  const post = await getPostByDateAndNumber({ date, number });

  return (
    <section>
      {post ? (
        <Post key={post._id} post={post} />
      ) : (
        <article className="border-t py-6 text-lg">
          <p>
            <strong>Postagem não encontrada.</strong>
          </p>
        </article>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: IProps) {
  const { date, number } = await params;

  return {
    title: `Deschamps News - ${dayjs(date).format("DD [de] MMM [de] YYYY")} - ${number}`,
  };
}
