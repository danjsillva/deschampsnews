"use client";

import { FiShare } from "react-icons/fi";
import { toast } from "react-toastify";

import dayjs from "@/utils/dayjs";

interface IProps {
  date: string;
  number: string;
}

export default function ShareButton(props: IProps) {
  const handleShareClick = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_BASE_URL}/${dayjs(props.date)
        .utc()
        .format("YYYY-MM-DD")}/${props.number}`,
    );
    toast("Link copiado para a sua área de transferência!");
  };

  return (
    <FiShare onClick={handleShareClick} size={20} className="cursor-pointer" />
  );
}
