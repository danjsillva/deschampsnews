import Link from "next/link";

import LikeButton from "@/components/like-button";
import ShareButton from "@/components/share-button";
import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";

interface IProps {
  post: IPost;
}

export default function Post(props: IProps) {
  return (
    <article className="border- border-gray-200 py-6 text-lg">
      {props.post.sponsored && (
        <span className="inline-block text-sm text-white bg-blue-500 rounded-full py-1 px-2 mb-2 mr-2">
          Patrocinado
        </span>
      )}

      {props.post.categories.map((category) => (
        <Link href={`/search?category=${category}`} key={category} passHref>
          <span className="inline-block text-sm text-gray-100 bg-gray-500 rounded-full py-1 px-2 mb-2 mr-2 cursor-pointer">
            {category}
          </span>
        </Link>
      ))}

      <div dangerouslySetInnerHTML={{ __html: props.post.html }} className="" />

      {props.post.entities.map((entity) => (
        <Link href={`/search?query=${entity}`} key={entity} passHref>
          <span className="inline-block text-sm text-gray-500 bg-gray-100 rounded-full py-1 px-2 mt-2 mr-2 cursor-pointer">
            {entity}
          </span>
        </Link>
      ))}

      <div className="flex justify-between align-middle text-gray-500 mt-4">
        <div>
          <LikeButton
            date={props.post.date}
            number={props.post.number}
            likes={props.post.likes}
          />
        </div>

        <Link href={`/${dayjs(props.post.date).utc().format("YYYY-MM-DD")}`} className="!no-underline">
          <span className="text-sm text-gray-500 hover:text-gray-700">
            {dayjs(props.post.date).utc().format("DD [de] MMMM [de] YYYY")}
          </span>
        </Link>

        <div>
          <ShareButton date={props.post.date} number={props.post.number} />
        </div>
      </div>
    </article>
  );
}
