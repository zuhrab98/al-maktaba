import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

const STATS = [
  { num: "8 425",  label: "книг" },
  { num: "3 146",  label: "авторов" },
  { num: "40",     label: "разделов" },
  { num: "7 млн",  label: "страниц" },
];

const FILTERS = [
  { ar: "الفقه",    ru: "Фикх",    href: "/catalog?cat=fiqh" },
  { ar: "الحديث",   ru: "Хадис",   href: "/catalog?cat=hadith" },
  { ar: "التفسير",  ru: "Тафсир",  href: "/catalog?cat=tafsir" },
  { ar: "العقيدة",  ru: "Акыда",   href: "/catalog?cat=aqida" },
  { ar: "التاريخ",  ru: "История", href: "/catalog?cat=history" },
];

export function Hero() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-item { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
        }
        .hero-item {
          opacity: 0;
          animation: fadeUp 0.4s cubic-bezier(0.2,0,0,1) forwards;
        }
        .hero-item:nth-child(1) { animation-delay: 0ms; }
        .hero-item:nth-child(2) { animation-delay: 80ms; }
        .hero-item:nth-child(3) { animation-delay: 160ms; }
        .hero-item:nth-child(4) { animation-delay: 240ms; }
        .hero-item:nth-child(5) { animation-delay: 320ms; }
      `}</style>

      <section
        aria-label="Главная"
        className="flex flex-col items-center px-6 pt-20 pb-18 border-b border-[var(--border)] w-full"
      >
        <div className="flex flex-col items-center w-full">

          {/* kicker */}
          <div className="hero-item flex items-center gap-2 mb-7" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,.15)]" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] tracking-[.04em]">
              8 425 книг доступно
            </span>
          </div>

          {/* search */}
          <div className="hero-item relative w-full max-w-[640px] mb-4">
            <Search
              size={16}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              placeholder="Поиск книг, авторов, разделов…"
              aria-label="Поиск по библиотеке"
              className={[
                "w-full h-[52px] pl-12 pr-16",
                "bg-[var(--surface)] border-[1.5px] border-[var(--border-2)] rounded-[var(--radius)]",
                "font-[family-name:var(--font-geist-sans)] text-[15px] text-[var(--text-1)]",
                "placeholder:text-[var(--text-3)]",
                "outline-none",
                "transition-[border-color,box-shadow] duration-150",
                "focus:border-[var(--text-1)] focus:shadow-[0_0_0_3px_rgba(10,10,9,.07)]",
              ].join(" ")}
            />
            <kbd
              aria-hidden
              className="absolute right-3.5 top-1/2 -translate-y-1/2 font-[family-name:var(--font-geist-mono)] text-[10px] bg-[var(--surface-2)] border border-[var(--border)] px-1.5 py-1 rounded text-[var(--text-3)]"
            >
              ⌘K
            </kbd>
          </div>

          {/* filters */}
          <div
            className="hero-item flex items-center flex-wrap justify-center gap-1.5 mb-16 w-full max-w-[640px]"
            role="group"
            aria-label="Быстрые фильтры"
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] tracking-[.04em] mr-1">
              Перейти:
            </span>
            {FILTERS.map(({ ar, ru, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "inline-flex items-center gap-1.5 h-7 px-2.5",
                  "bg-[var(--surface-2)] border border-[var(--border)] rounded-full",
                  "text-[12.5px] text-[var(--text-2)] whitespace-nowrap",
                  "transition-[background-color,border-color,color] duration-150",
                  "hover:bg-[var(--surface-3)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]",
                  "active:scale-[0.96]",
                ].join(" ")}
              >
                <span className="font-[family-name:var(--font-amiri)] text-[13px] leading-none" dir="rtl">
                  {ar}
                </span>
                {ru}
              </Link>
            ))}
          </div>

          {/* stats */}
          <dl
            className="hero-item flex w-full max-w-[640px] bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden"
            aria-label="Статистика библиотеки"
          >
            {STATS.map(({ num, label }, i) => (
              <div
                key={label}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-4",
                  "transition-[background-color] duration-150 hover:bg-[var(--surface-3)]",
                  i < STATS.length - 1 ? "border-r border-[var(--border)]" : "",
                ].join(" ")}
              >
                <dt className="text-[15px] font-semibold tracking-tight tabular-nums text-[var(--text-1)] leading-none">
                  {num}
                </dt>
                <dd className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] tracking-[.02em] leading-none">
                  {label}
                </dd>
              </div>
            ))}
          </dl>

          {/* cta */}
          <div className="hero-item flex gap-2 mt-7">
            <Link
              href="/catalog"
              className={[
                "inline-flex items-center gap-1.5 h-9 px-4",
                "bg-[var(--text-1)] text-white border border-[var(--text-1)] rounded-[var(--radius-sm)]",
                "text-[13.5px] font-medium",
                "shadow-[0_1px_2px_rgba(0,0,0,.12)]",
                "transition-[background-color,border-color,box-shadow] duration-150",
                "hover:bg-[#1a1a18] hover:shadow-[0_2px_6px_rgba(0,0,0,.16)]",
                "active:scale-[0.96]",
              ].join(" ")}
            >
              Весь каталог
              <ArrowRight size={12} strokeWidth={2.2} aria-hidden />
            </Link>
            <Link
              href="/authors"
              className={[
                "inline-flex items-center h-9 px-4",
                "bg-transparent text-[var(--text-2)] border border-[var(--border)] rounded-[var(--radius-sm)]",
                "text-[13.5px] font-medium",
                "transition-[background-color,border-color,color] duration-150",
                "hover:bg-[var(--surface-2)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]",
                "active:scale-[0.96]",
              ].join(" ")}
            >
              Авторы
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
