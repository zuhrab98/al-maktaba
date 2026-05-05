"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  bookId: number;
  pageNumbers: number[]; // все физические номера страниц [76, 78, 80, ...]
  currentPage: number;   // текущий физический номер
};

export function ReaderNav({ bookId, pageNumbers, currentPage }: Props) {
  const router = useRouter();

  let currentIdx = pageNumbers.indexOf(currentPage);
  if (currentIdx === -1) {
    currentIdx = pageNumbers.findIndex(p => p > currentPage);
    if (currentIdx === -1) currentIdx = pageNumbers.length - 1;
  }
  const prevPage = currentIdx > 0 ? pageNumbers[currentIdx - 1] : null;
  const nextPage = currentIdx < pageNumbers.length - 1 ? pageNumbers[currentIdx + 1] : null;

  const goTo = (page: number) => {
    window.scrollTo(0, 0);
    router.push(`/books/${bookId}/pages/${page}`);
  };


  // Клавиши ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" && nextPage) {
        e.preventDefault();
        goTo(nextPage!);
      } else if (e.key === "ArrowLeft" && prevPage) {
        e.preventDefault();
        goTo(prevPage!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookId, prevPage, nextPage, router]);

  // Строим список страниц для показа
  // Показываем: первую, соседей текущей, последнюю — с многоточиями
  const total = pageNumbers.length;
  const visiblePages: (number | "…")[] = [];

  const addPage = (idx: number) => {
    if (idx >= 0 && idx < total) {
      const p = pageNumbers[idx];
      if (!visiblePages.includes(p)) visiblePages.push(p);
    }
  };

  addPage(0); // первая
  if (currentIdx - 3 > 1) visiblePages.push("…");
  addPage(currentIdx - 2);
  addPage(currentIdx - 1);
  addPage(currentIdx);
  addPage(currentIdx + 1);
  addPage(currentIdx + 2);
  if (currentIdx + 3 < total - 2) visiblePages.push("…");
  addPage(total - 1); // последняя

  return (
    <>
    {/* Mobile */}
    <div className="fixed bottom-0 left-0 right-0 z-20 flex lg:hidden items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-2">
      <button
        onClick={() => prevPage && goTo(prevPage)}
        disabled={!prevPage}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      {visiblePages.map((p, i) =>
        p === "…" ? (
          <span key={`m-ell-${i}`} className="w-8 flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] select-none">
            ···
          </span>
        ) : (
          <button
            key={`m-${p}`}
            onClick={() => goTo(p as number)}
            className={[
              "min-w-[28px] h-8 px-1.5 flex items-center justify-center rounded-[var(--radius-sm)]",
              "font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums transition-colors",
              p === currentPage
                ? "bg-[var(--text-1)] text-white font-medium"
                : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => nextPage && goTo(nextPage)}
        disabled={!nextPage}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} strokeWidth={2} />
      </button>
    </div>

    {/* Desktop */}
    <div className="fixed bottom-0 left-[350px] right-0 z-20 hidden lg:flex items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-4">

      {/* ← */}
      <button
        onClick={() => prevPage && goTo(prevPage)}
        disabled={!prevPage}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      {/* Страницы */}
      {visiblePages.map((p, i) =>
        p === "…" ? (
          <span key={`ell-${i}`} className="w-8 flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[12px] text-[var(--text-3)] select-none">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            className={[
              "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-[var(--radius-sm)]",
              "font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-colors",
              p === currentPage
                ? "bg-[var(--text-1)] text-white font-medium tabular-nums"
                : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] tabular-nums",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      {/* → */}
      <button
        onClick={() => nextPage && goTo(nextPage)}
        disabled={!nextPage}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} strokeWidth={2} />
      </button>

    </div>
    </>
  );
}
