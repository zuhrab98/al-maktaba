"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  bookId: number;
  prevId: number | null;
  nextId: number;
  currentShamelaId: number;
  totalPages: number;
};

export function ReaderNav({ bookId, prevId, nextId, currentShamelaId, totalPages }: Props) {
  const router = useRouter();

  // Клавиши ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.key === "ArrowRight") router.push(`/books/${bookId}/pages/${nextId}`);
        else if (e.key === "ArrowLeft" && prevId) router.push(`/books/${bookId}/pages/${prevId}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookId, prevId, nextId, router]);

  // Строим список страниц для показа
  // Показываем: 1 ... (cur-2) (cur-1) cur (cur+1) (cur+2) ... total
  const pages: (number | "…")[] = [];
  const cur = currentShamelaId;
  const total = totalPages;

  const add = (n: number) => {
    if (n >= 1 && n <= total && !pages.includes(n)) pages.push(n);
  };

  add(1);
  if (cur - 3 > 2) pages.push("…");
  add(cur - 2);
  add(cur - 1);
  add(cur);
  add(cur + 1);
  add(cur + 2);
  if (cur + 3 < total - 1) pages.push("…");
  add(total);

  return (
    <div className="fixed bottom-0 left-[350px] right-0 z-20 lg:flex hidden items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-4">

      {/* ← */}
      <button
        onClick={() => prevId && router.push(`/books/${bookId}/pages/${prevId}`)}
        disabled={!prevId}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      {/* Страницы */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ell-${i}`} className="w-8 flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[12px] text-[var(--text-3)] select-none">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => router.push(`/books/${bookId}/pages/${p}`)}
            className={[
              "w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]",
              "font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums transition-colors",
              p === cur
                ? "bg-[var(--text-1)] text-white font-medium"
                : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      {/* → */}
      <button
        onClick={() => router.push(`/books/${bookId}/pages/${nextId}`)}
        disabled={currentShamelaId >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} strokeWidth={2} />
      </button>

    </div>
  );
}
