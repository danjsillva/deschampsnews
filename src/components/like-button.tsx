"use client";

import { useState } from "react";
import { FiHeart } from "react-icons/fi";

// import { likePost } from "@/services/post";

interface IProps {
  date: string;
  number: string;
  likes: number;
}

export default function Post(props: IProps) {
  const [likes, setLikes] = useState(props.likes);

  const handleLikeClick = async () => {
    setLikes((currentLikes) => currentLikes + 1);

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
      {likes}
    </div>
  );
}
