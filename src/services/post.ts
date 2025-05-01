import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";
import mongodb from "@/utils/mongodb";

export async function getPostsByDate(date: string): Promise<IPost[]> {
  const db = await mongodb.connect();

  if (!dayjs(String(date)).isValid()) {
    throw new Error("Invalid date");
  }

  const posts = await db
    .collection("posts")
    .find<IPost>({
      date: {
        $gte: dayjs(String(date)).startOf("day").toDate(),
        $lte: dayjs(String(date)).endOf("day").toDate(),
      },
    })
    .sort({ number: 1 })
    .toArray();

  return posts;
}
