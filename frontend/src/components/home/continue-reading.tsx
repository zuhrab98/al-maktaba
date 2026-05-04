import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BOOKS = [
  {
    id: 1,
    title: "صحيح البخاري",
    chapter: "باب فضل العلم على العبادة",
    author: "محمد بن إسماعيل البخاري",
    progress: 42,
    page: 1342,
    total: 3204,
  },
  {
    id: 2,
    title: "مجموع الفتاوى",
    chapter: "في حقيقة الإيمان وكماله",
    author: "تقي الدين ابن تيمية",
    progress: 78,
    page: 712,
    total: 912,
  },
  {
    id: 3,
    title: "إحياء علوم الدين",
    chapter: "كتاب آداب تلاوة القرآن",
    author: "أبو حامد الغزالي",
    progress: 14,
    page: 218,
    total: 1556,
  },
];

export function ContinueReading() {
  return (
    <section className="px-6 py-12 border-b border-[var(--border)] max-w-[1280px] mx-auto w-full">
      {/* section head */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] uppercase tracking-[.14em] mb-1.5">
            Продолжить чтение
          </p>
          <h2 className="text-[20px] font-semibold tracking-tight text-[var(--text-1)]">
            Где вы остановились
          </h2>
        </div>
        <Link
          href="/me"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-[color] duration-150"
        >
          Все в /me
          <ArrowRight size={11} strokeWidth={2} aria-hidden />
        </Link>
      </div>

      {/* cards */}
      <div className="grid grid-cols-3 gap-3">
        {BOOKS.map((book) => (
          <Link
              key={book.id}
              href={`/books/${book.id}`}
              className={[
                "flex flex-col gap-3 p-4 rounded-[var(--radius)]",
                "bg-[var(--surface-2)] border border-[var(--border)]",
                "transition-[background-color,border-color,box-shadow] duration-150",
                "hover:bg-[var(--surface-3)] hover:border-[var(--border-2)]",
                "hover:shadow-[var(--shadow-border-hover)]",
                "active:scale-[0.99]",
              ].join(" ")}
            >
              {/* top row */}
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-geist-mono)] text-[9.5px] text-[var(--text-3)] uppercase tracking-[.1em]">
                  стр. {book.page.toLocaleString("ru")} / {book.total.toLocaleString("ru")}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-medium text-[var(--text-1)] tabular-nums">
                  {book.progress}%
                </span>
              </div>

              {/* arabic title */}
              <div>
                <p
                  dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[20px] font-bold text-[var(--text-1)] leading-snug"
                >
                  {book.title}
                </p>
                <p
                  dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[12.5px] text-[var(--text-2)] mt-0.5"
                >
                  {book.chapter}
                </p>
              </div>

              {/* author */}
              <p
                dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[12px] text-[var(--text-3)]"
              >
                {book.author}
              </p>

              {/* progress bar */}
              <div className="relative h-px bg-[var(--border)] mt-auto">
                <div
                  className="absolute left-0 top-[-1px] h-[3px] rounded-full bg-[var(--text-1)]"
                  style={{ width: `${book.progress}%` }}
                />
              </div>

              {/* bottom */}
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-geist-mono)] text-[9.5px] text-[var(--text-3)] uppercase tracking-[.08em]">
                  читать
                </span>
                <ArrowRight size={11} strokeWidth={2} className="text-[var(--text-3)]" aria-hidden />
              </div>
            </Link>
        ))}
      </div>
    </section>
  );
}
