import Link from "next/link";

import Post from "@/components/post";
import { getPostsByDate } from "@/services/post";
import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";

export default async function HomePage() {
  const date = dayjs().format("YYYY-MM-DD");
  const posts = await getPostsByDate({ date });

  return (
    <section>
      {posts.map((post: IPost) => (
        <Post key={post._id?.toString()} post={post} />
      ))}

      {!posts.length && (
        <article className="border-t py-6 text-lg">
          <p>
            <strong>As notícias de hoje chegam lá pelas 11:30.</strong> Veja a
            última newsletter{" "}
            <Link href={`/${dayjs().subtract(1, "day").format("YYYY-MM-DD")}`}>
              aqui
            </Link>
            .
          </p>
        </article>
      )}
    </section>
  );
}

export async function generateMetadata() {
  return {
    title: `Deschamps News - ${dayjs().format("DD [de] MMM [de] YYYY")}`,
  };
}
