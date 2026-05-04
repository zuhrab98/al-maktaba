"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useState } from "react";

export type Book = {
  id: number;
  title: string;
  author: string;
  deathYear: string;
  deathYearM: string;
  pages: number;
  category: string;
};

function BookRow({ book, index }: { book: Book; index: number }) {
  const [saved, setSaved] = useState(false);

  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-[background-color] duration-150 group">

      {/* # */}
      <td className="w-10 px-3 py-3.5 text-right border-r border-[var(--border)]">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] tabular-nums select-none">
          {index + 1}
        </span>
      </td>

      {/* книга */}
      <td className="px-5 py-3.5 border-r border-[var(--border)] max-w-0">
        <Link href={`/books/${book.id}`} className="block">
          <p lang="ar" dir="rtl" className="font-[family-name:var(--font-amiri)] text-[16px] font-bold text-[var(--text-1)] leading-snug truncate">
            {book.title}
          </p>
          <p lang="ar" dir="rtl" className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-2)] truncate mt-0.5">
            {book.author}
          </p>
        </Link>
      </td>

      {/* раздел */}
      <td className="w-32 px-4 py-3.5 border-r border-[var(--border)] text-right">
        <span lang="ar" className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)]">
          {book.category}
        </span>
      </td>

      {/* год смерти */}
      <td className="w-28 px-4 py-3.5 border-r border-[var(--border)]">
        <span className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)]" dir="rtl">
          ت. {book.deathYear} هـ
        </span>
      </td>

      {/* страниц */}
      <td className="w-28 px-4 py-3.5">
        <span className="font-[family-name:var(--font-geist-mono)] text-[13px] font-medium text-[var(--text-1)] tabular-nums">
          {book.pages.toLocaleString("ru")}
        </span>
      </td>

      {/* bookmark */}
      <td className="w-10 pr-2">
        <button
          aria-label={`${saved ? "Убрать из" : "Добавить в"} закладки`}
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
          className={[
            "w-8 h-8 rounded-[var(--radius-sm)]",
            "inline-flex items-center justify-center",
            "border transition-[background-color,border-color,color,opacity,scale] duration-150",
            "touch-action-manipulation active:scale-[0.96]",
            saved ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            saved
              ? "bg-[var(--text-1)] border-[var(--text-1)] text-white"
              : "bg-transparent border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]",
          ].join(" ")}
        >
          <Bookmark size={13} strokeWidth={1.8} aria-hidden />
        </button>
      </td>
    </tr>
  );
}

export function BookList({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[var(--text-3)] text-[14px]">Ничего не найдено</p>
        <p className="text-[var(--text-3)] text-[12px] mt-1 font-[family-name:var(--font-geist-mono)]">
          Попробуйте изменить запрос или фильтры
        </p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
          <th className="w-10 px-3 py-2 text-right border-r border-[var(--border)] font-normal">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] uppercase tracking-[.12em]">#</span>
          </th>
          <th className="px-5 py-2 border-r border-[var(--border)] text-right font-normal">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] uppercase tracking-[.12em]">Книга / Автор</span>
          </th>
          <th className="w-32 px-4 py-2 border-r border-[var(--border)] text-right font-normal">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] uppercase tracking-[.12em]">Раздел</span>
          </th>
          <th className="w-28 px-4 py-2 border-r border-[var(--border)] text-left font-normal">
            <span className="font-[family-name:var(--font-amiri)] text-[12px] text-[var(--text-3)]" dir="rtl">ت. هـ</span>
          </th>
          <th className="w-28 px-4 py-2 text-left font-normal">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] uppercase tracking-[.12em]">Страниц</span>
          </th>
          <th className="w-10" />
        </tr>
      </thead>
      <tbody>
        {books.map((book, i) => (
          <BookRow key={book.id} book={book} index={i} />
        ))}
      </tbody>
    </table>
  );
}
