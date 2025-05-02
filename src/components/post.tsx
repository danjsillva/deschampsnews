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
        <span className="inline-block text-sm text-white bg-blue-500 rounded-full py-1 px-2 mb-2">
          Patrocinado
        </span>
      )}

      <div dangerouslySetInnerHTML={{ __html: props.post.html }} className="" />

      {props.post.entities.map((entity) => (
        <Link href={`/search?q=${entity}`} key={entity} passHref>
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

        <span className="text-sm">
          {dayjs(props.post.date).utc().format("DD [de] MMMM [de] YYYY")}
        </span>

        <div>
          <ShareButton date={props.post.date} number={props.post.number} />
        </div>
      </div>
    </article>
  );
}
