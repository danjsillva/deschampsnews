import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";
import mongodb from "@/utils/mongodb";

export async function getPostsByDate({
  date,
}: {
  date: string;
}): Promise<IPost[]> {
  const db = await mongodb.connect();

  if (!dayjs(String(date)).isValid()) {
    throw new Error("Invalid date");
  }

  const posts = await db
    .collection("posts")
    .find<IPost>({ date })
    .sort({ number: 1 })
    .toArray();

  return posts;
}

export async function likePost({
  date,
  number,
}: {
  date: string;
  number: string;
}): Promise<{ success: boolean }> {
  if (!dayjs(String(date)).isValid()) {
    throw new Error("Invalid date");
  }

  if (!number) {
    throw new Error("Invalid number");
  }

  return { success: true };
}
