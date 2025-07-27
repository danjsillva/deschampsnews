"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";

import dayjs from "@/utils/dayjs";
import { FaTimes } from "react-icons/fa";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [search, setSearch] = useState(queryParam);

  const getSelectedDate = () => {
    const dateMatch = pathname.match(/^\/(\d{4}-\d{2}-\d{2})$/);

    if (dateMatch) return dateMatch[1];

    return dayjs().format("YYYY-MM-DD");
  };

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

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
      return router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }

    return router.push("/");
  };

  return (
    <section className="sticky top-0 flex flex-col items-end text-end">
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

      <form onSubmit={handleSubmitSearch} className="mt-10">
        <div className="border border-gray-200 rounded py-3 px-4">
          <input
            type="text"
            value={search}
            className="outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <span
              className="text-sm text-gray-400 cursor-pointer"
              onClick={() => setSearch("")}
            >
              <FaTimes className="inline-block" />
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
