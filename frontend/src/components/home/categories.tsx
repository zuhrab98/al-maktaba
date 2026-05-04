import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATS = [
  { id: 1,  ar: "الفقه",          slug: "fiqh",    count: 958 },
  { id: 2,  ar: "الحديث",         slug: "hadith",   count: 742 },
  { id: 3,  ar: "التفسير",         slug: "tafsir",   count: 318 },
  { id: 4,  ar: "العقيدة والفرق",  slug: "aqida",    count: 421 },
  { id: 5,  ar: "التاريخ والسير",  slug: "history",  count: 534 },
  { id: 6,  ar: "اللغة والنحو",   slug: "language", count: 287 },
  { id: 7,  ar: "التصوف والرقائق", slug: "sufism",   count: 193 },
  { id: 8,  ar: "الفتاوى",        slug: "fatawa",   count: 156 },
];

export function Categories() {
  return (
    <section className="px-6 py-12 border-b border-[var(--border)] max-w-[1280px] mx-auto w-full">
      {/* head */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] uppercase tracking-[.14em] mb-1.5">
            Разделы библиотеки
          </p>
          <h2 className="text-[20px] font-semibold tracking-tight text-[var(--text-1)]">
            8 больших разделов
          </h2>
        </div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-[color] duration-150"
        >
          Все 40 категорий
          <ArrowRight size={11} strokeWidth={2} aria-hidden />
        </Link>
      </div>

      {/* grid */}
      <div
        className={[
          "grid grid-cols-4",
          "border border-[var(--border)] rounded-[var(--radius)] overflow-hidden",
          /* 1px gaps via background */
          "gap-px bg-[var(--border)]",
        ].join(" ")}
      >
        {CATS.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/catalog?cat=${cat.slug}`}
            className={[
              "group flex flex-col justify-between",
              "min-h-[136px] p-5",
              "bg-[var(--surface)] hover:bg-[var(--surface-2)]",
              "transition-[background-color] duration-150",
            ].join(" ")}
          >
            {/* top */}
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[9.5px] text-[var(--text-3)] uppercase tracking-[.14em] mb-3">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p
                dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[20px] font-bold text-[var(--text-1)] leading-snug"
              >
                {cat.ar}
              </p>
            </div>

            {/* bottom */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border)]">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-2)]">
                <span className="font-semibold text-[var(--text-1)] tabular-nums">
                  {cat.count.toLocaleString("ru")}
                </span>{" "}
                книг
              </span>
              <ArrowRight
                size={13}
                strokeWidth={1.8}
                className="text-[var(--text-3)] group-hover:text-[var(--text-1)] group-hover:translate-x-0.5 transition-[color,transform] duration-150"
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
