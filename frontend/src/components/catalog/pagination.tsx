import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );

  const items: (number | "…")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push("…");
    items.push(p);
  });

  const linkCls = [
    "inline-flex items-center justify-center gap-1",
    "min-w-[32px] h-8 px-2 rounded-[var(--radius-sm)]",
    "font-[family-name:var(--font-geist-mono)] text-[12px]",
    "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
    "transition-[background-color,color] duration-150",
    "active:scale-[0.96]",
  ].join(" ");

  const disabledCls = [
    "inline-flex items-center justify-center gap-1",
    "min-w-[32px] h-8 px-2 rounded-[var(--radius-sm)]",
    "font-[family-name:var(--font-geist-mono)] text-[12px]",
    "text-[var(--text-3)] opacity-40 cursor-not-allowed select-none",
  ].join(" ");

  return (
    <div className="flex items-center justify-center gap-1 px-6 py-4 border-t border-[var(--border)]">

      {/* prev */}
      {page > 1 ? (
        <Link href={buildHref(page - 1)} aria-label="Предыдущая страница" className={linkCls}>
          <ChevronLeft size={13} strokeWidth={2} aria-hidden /> Назад
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledCls}>
          <ChevronLeft size={13} strokeWidth={2} aria-hidden /> Назад
        </span>
      )}

      {/* pages */}
      <nav aria-label="Пагинация" className="flex items-center gap-0.5">
        {items.map((item, i) =>
          item === "…" ? (
            <span
              key={`ell-${i}`}
              className="px-1 text-[var(--text-3)] font-[family-name:var(--font-geist-mono)] text-[12px] select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildHref(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Страница ${item}`}
              className={[
                "inline-flex items-center justify-center",
                "min-w-[32px] h-8 px-2 rounded-[var(--radius-sm)]",
                "font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums",
                "transition-[background-color,color,scale] duration-150",
                "active:scale-[0.96]",
                item === page
                  ? "bg-[var(--text-1)] text-white"
                  : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
              ].join(" ")}
            >
              {item}
            </Link>
          )
        )}
      </nav>

      {/* next */}
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} aria-label="Следующая страница" className={linkCls}>
          Вперёд <ChevronRight size={13} strokeWidth={2} aria-hidden />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledCls}>
          Вперёд <ChevronRight size={13} strokeWidth={2} aria-hidden />
        </span>
      )}

    </div>
  );
}
