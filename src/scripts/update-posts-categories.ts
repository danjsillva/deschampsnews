import "dotenv/config";

import { ObjectId } from "mongodb";

import { IPost } from "@/types/post";
import { getGroqCategory } from "@/utils/groq";
import mongodb from "@/utils/mongodb";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.time("Update posts categories");

  const db = await mongodb.connect();

  const posts = await db
    .collection("posts")
    .find<IPost>({
      $or: [
        { categories: { $exists: false } },
        { categories: { $eq: [] } },
        { entities: { $exists: false } },
        { sponsored: { $exists: false } },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  for (const [index, post] of posts.entries()) {
    try {
      console.log(
        `Processing post ${post._id}... (${index + 1}/${posts.length})`,
      );

      const { categories, entities, sponsored } = await getGroqCategory({
        text: post.text,
      });

      console.log({
        ...post,
        categories: categories,
        entities: entities,
        sponsored: sponsored,
      });

      const updatedPost = await db.collection("posts").updateOne(
        { _id: new ObjectId(post._id) },
        {
          $set: {
            ...post,
            categories: categories,
            entities: entities,
            sponsored: sponsored,
          },
        },
      );

      console.log(updatedPost);
      console.log(
        `Processed post ${post._id} successfully! (${index + 1}/${posts.length})`,
      );
    } catch (err) {
      console.error(`Erro ao processar post ${post._id}:`, err);
    }

    if (index % 2 === 0) {
      console.log("Sleeping for 5 seconds...");

      await sleep(5000);
    }
  }

  console.timeEnd("Update posts categories");
  process.exit(0);
}

main();
