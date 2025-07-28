"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { FaTimes } from "react-icons/fa";

import dayjs from "@/utils/dayjs";

const TOP_CATEGORIES = [
  "Esportes",
  "Política",
  "Economia",
  "Tecnologia",
  "Entretenimento",
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || "";
  const categoryParam = searchParams.get("category") || "";
  const [search, setSearch] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  useEffect(() => {
    setSearch(queryParam);
    setSelectedCategory(categoryParam);
  }, [queryParam, categoryParam]);

  const getSelectedDate = () => {
    const dateMatch = pathname.match(/^\/(\d{4}-\d{2}-\d{2})$/);

    if (dateMatch) return dateMatch[1];

    return dayjs().format("YYYY-MM-DD");
  };

  const handleChangeDate = (value: Date | unknown) => {
    if (!(value instanceof Date)) {
      return;
    }

    if (dayjs(value).isToday()) {
      return router.push("/");
    }

    return router.push(`/${dayjs(value).format("YYYY-MM-DD")}`);
  };

  const handleSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (search?.trim()) {
      const url = selectedCategory
        ? `/search?query=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(selectedCategory)}`
        : `/search?query=${encodeURIComponent(search.trim())}`;
      return router.push(url);
    }

    return router.push("/");
  };

  const handleClearSearch = () => {
    setSearch("");
    setSelectedCategory("");

    return router.push("/");
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);

    if (search?.trim()) {
      return router.push(
        `/search?query=${encodeURIComponent(search.trim())}&category=${encodeURIComponent(category)}`,
      );
    }

    return router.push(
      `/search?query=&category=${encodeURIComponent(category)}`,
    );
  };

  return (
    <section className="sticky top-0 flex flex-col">
      <Link href="/" className="!no-underline">
        <h1 className="text-6xl font-bold text-black mt-16">Deschamps News</h1>
      </Link>

      <Calendar
        onChange={handleChangeDate}
        value={dayjs(getSelectedDate()).toDate()}
        locale="pt-BR"
        minDate={dayjs("2020-12-10").toDate()}
        maxDate={dayjs().toDate()}
        next2Label={null}
        prev2Label={null}
        tileDisabled={({ date }) =>
          dayjs(date).weekday() === 0 || dayjs(date).weekday() === 6
        }
      />

      <form onSubmit={handleSubmitSearch} className="mt-10 w-full">
        <div className="border border-gray-200 rounded py-3 px-4">
          <input
            type="text"
            value={search}
            className="outline-none w-full"
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <span
              className="text-sm text-gray-400 cursor-pointer"
              onClick={handleClearSearch}
            >
              <FaTimes className="inline-block" />
            </span>
          )}
        </div>
      </form>

      <div className="mt-10 flex gap-2 w-full">
        {TOP_CATEGORIES.map((category) => (
          <span
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`inline-block text-sm rounded-full py-1 px-2 mb-2 mr-2 cursor-pointer ${
              selectedCategory === category
                ? "text-white bg-blue-500 font-semibold"
                : "text-gray-500 bg-gray-100"
            }`}
          >
            {category}
          </span>
        ))}
      </div>
    </section>
  );
}
