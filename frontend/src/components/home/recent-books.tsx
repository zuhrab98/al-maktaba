import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BOOKS = [
  {
    id: 10,
    title: "الموافقات",
    author: "أبو إسحاق الشاطبي",
    category: "Фикх",
    pages: 1240,
    gradient: "from-[#c8b48a] to-[#6b4c1e]",
  },
  {
    id: 11,
    title: "فتح الباري",
    author: "ابن حجر العسقلاني",
    category: "Хадис",
    pages: 4820,
    gradient: "from-[#a08870] to-[#4a3218]",
  },
  {
    id: 12,
    title: "البداية والنهاية",
    author: "ابن كثير الدمشقي",
    category: "История",
    pages: 3640,
    gradient: "from-[#b8a07a] to-[#5c4420]",
  },
  {
    id: 13,
    title: "تفسير الطبري",
    author: "محمد بن جرير الطبري",
    category: "Тафсир",
    pages: 5200,
    gradient: "from-[#9e8866] to-[#423214]",
  },
];

export function RecentBooks() {
  return (
    <section className="px-6 py-12 border-b border-[var(--border)] max-w-[1280px] mx-auto w-full">
      {/* head */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] uppercase tracking-[.14em] mb-1.5">
            Недавно добавленные
          </p>
          <h2 className="text-[20px] font-semibold tracking-tight text-[var(--text-1)]">
            Новые в каталоге
          </h2>
        </div>
        <Link
          href="/catalog?sort=recent"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-[color] duration-150"
        >
          Все новые
          <ArrowRight size={11} strokeWidth={2} aria-hidden />
        </Link>
      </div>

      {/* grid */}
      <div className="grid grid-cols-4 gap-5">
        {BOOKS.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="group flex flex-col gap-3"
          >
            {/* cover */}
            <div
              className={[
                "relative aspect-[3/4] rounded-[5px] overflow-hidden",
                `bg-gradient-to-br ${book.gradient}`,
                /* subtle spine line */
                "before:absolute before:left-2.5 before:top-0 before:bottom-0 before:w-px before:bg-black/20",
                /* image outline */
                "outline outline-1 -outline-offset-1 outline-black/10",
                "shadow-[0_4px_12px_-4px_rgba(0,0,0,.2)]",
                "group-hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,.28)]",
                "transition-[box-shadow,transform] duration-200",
                "group-hover:-translate-y-0.5",
              ].join(" ")}
              aria-hidden
            />

            {/* meta */}
            <div className="flex flex-col gap-1">
              <p
                dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[17px] font-bold text-[var(--text-1)] leading-snug group-hover:text-[var(--text-1)]"
              >
                {book.title}
              </p>
              <p
                dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[12.5px] text-[var(--text-2)]"
              >
                {book.author}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-[family-name:var(--font-geist-mono)] text-[9.5px] text-[var(--text-3)] uppercase tracking-[.08em]">
                  {book.category}
                </span>
                <span className="w-px h-2.5 bg-[var(--border)]" aria-hidden />
                <span className="font-[family-name:var(--font-geist-mono)] text-[9.5px] text-[var(--text-3)] tabular-nums">
                  {book.pages.toLocaleString("ru")} стр.
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
