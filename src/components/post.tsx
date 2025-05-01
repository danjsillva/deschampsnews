import Link from "next/link";
import { FiHeart, FiShare } from "react-icons/fi";
import { toast } from "react-toastify";

import { IPost } from "@/types/post";
import dayjs from "@/utils/dayjs";

interface IProps {
  post: IPost;
}

export default function Post(props: IProps) {
  // const handleClickLike = async () => {
  //   props.post.likes++;
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${dayjs(props.post.date)
  //       .utc()
  //       .format("YYYY-MM-DD")}/${props.post.number}/likes`,
  //     {
  //       method: "POST",
  //     },
  //   );
  // };

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

      {
        <div className="flex justify-between align-middle text-gray-500 mt-4">
          <div className="flex">
            <FiHeart size={24} className="mr-2 cursor-pointer" />{" "}
            {props.post.likes}
          </div>

          <span className="text-sm">
            {dayjs(props.post.date).utc().format("DD [de] MMMM [de] YYYY")}
          </span>

          <div>
            <FiShare
              // onClick={() => {
              //   navigator.clipboard.writeText(
              //     `${process.env.NEXT_PUBLIC_APP_BASE_URL}/${dayjs(
              //       props.post.date,
              //     )
              //       .utc()
              //       .format("YYYY-MM-DD")}/${props.post.number}`,
              //   );
              //   toast("Link copiado para a sua área de transferência!");
              // }}
              size={24}
              className="cursor-pointer"
            />
          </div>
        </div>
      }
    </article>
  );
}
