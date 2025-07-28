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

export async function getPostByDateAndNumber({
  date,
  number,
}: {
  date: string;
  number: string;
}): Promise<IPost | null> {
  const db = await mongodb.connect();

  if (!dayjs(String(date)).isValid()) {
    throw new Error("Invalid date");
  }

  if (!number) {
    throw new Error("Invalid number");
  }

  const post = await db.collection("posts").findOne<IPost>({ date, number });

  return post;
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

export async function searchPosts({
  query,
  category,
  limit = 50,
}: {
  query: string;
  category?: string;
  limit?: number;
}): Promise<IPost[]> {
  const db = await mongodb.connect();
  const collection = db.collection("posts");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (query && query.trim().length > 0) {
    filter.text = { $in: [new RegExp(query, "i")] };
  }

  if (category) {
    filter.categories = { $in: [category] };
  }

  if (Object.keys(filter).length === 0) {
    return [];
  }

  const posts = await collection
    .find<IPost>(filter)
    .sort({ date: -1 })
    .limit(limit)
    .toArray();

  return posts;
}
