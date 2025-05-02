"use client";

import { FiHeart } from "react-icons/fi";

// import { likePost } from "@/services/post";

interface IProps {
  date: string;
  number: string;
  likes: number;
}

export default function Post(props: IProps) {
  const handleLikeClick = async () => {
    props.likes++;

    // await likePost({
    //   date: props.date,
    //   number: props.number,
    // });
  };

  return (
    <div className="flex">
      <FiHeart
        onClick={handleLikeClick}
        size={20}
        className="mr-2 cursor-pointer"
      />{" "}
      {props.likes}
    </div>
  );
}
