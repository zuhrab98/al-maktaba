"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PageEntry = {
  shamelaId: number;
  page: number | null;
  part: string | null;
};

type Props = {
  bookId: number;
  pages: PageEntry[];
  currentShamelaId: number;
};

export function ReaderNav({ bookId, pages, currentShamelaId }: Props) {
  const router = useRouter();

  const currentIdx = pages.findIndex(p => p.shamelaId === currentShamelaId);
  const prevEntry = currentIdx > 0 ? pages[currentIdx - 1] : null;
  const nextEntry = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null;

  const goTo = (shamelaId: number) => {
    window.scrollTo(0, 0);
    router.push(`/books/${bookId}/pages/${shamelaId}`);
  };

  // Клавиши ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" && nextEntry) {
        e.preventDefault();
        goTo(nextEntry.shamelaId);
      } else if (e.key === "ArrowLeft" && prevEntry) {
        e.preventDefault();
        goTo(prevEntry.shamelaId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookId, prevEntry, nextEntry, router]);

  const currentEntry = pages[currentIdx];
  const currentPart = currentEntry?.part ?? null;

  // Страницы текущего тома (или все если нет томов)
  const volumePages = currentPart
    ? pages.filter(p => p.part === currentPart)
    : pages;

  const volumeIdx = Math.max(0, volumePages.findIndex(p => p.shamelaId === currentShamelaId));

  // Строим видимые кнопки пагинации — физические страницы тома с многоточиями
  // Показываем: первую, соседей текущей, последнюю
  const total = volumePages.length;
  const visibleEntries: (PageEntry | "…")[] = [];

  const addEntry = (idx: number) => {
    if (idx < 0 || idx >= total) return;
    const e = volumePages[idx];
    if (!e) return;
    if (!visibleEntries.some(v => v !== "…" && (v as PageEntry).shamelaId === e.shamelaId)) {
      visibleEntries.push(e);
    }
  };

  addEntry(0);
  if (volumeIdx - 3 > 1) visibleEntries.push("…");
  addEntry(volumeIdx - 2);
  addEntry(volumeIdx - 1);
  addEntry(volumeIdx);
  addEntry(volumeIdx + 1);
  addEntry(volumeIdx + 2);
  if (volumeIdx + 3 < total - 2) visibleEntries.push("…");
  addEntry(total - 1);

  // Метка кнопки — физическая страница или shamelaId если нет page
  const pageLabel = (e: PageEntry) => e.page != null ? String(e.page) : String(e.shamelaId);

  const navButton = (e: PageEntry | "…", i: number, size: "sm" | "md") => {
    if (e === "…") {
      return (
        <span key={`ell-${i}`}
          className={`flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[var(--text-3)] select-none ${size === "sm" ? "w-8 text-[11px]" : "w-8 text-[12px]"}`}>
          ···
        </span>
      );
    }
    const isActive = e.shamelaId === currentShamelaId;
    return (
      <button
        key={e.shamelaId}
        onClick={() => goTo(e.shamelaId)}
        className={[
          "h-8 flex items-center justify-center rounded-[var(--radius-sm)] tabular-nums transition-colors font-[family-name:var(--font-geist-mono)]",
          size === "sm" ? "min-w-[28px] px-1.5 text-[11px]" : "min-w-[32px] px-2 text-[12px]",
          isActive
            ? "bg-[var(--text-1)] text-white font-medium"
            : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
        ].join(" ")}
      >
        {pageLabel(e)}
      </button>
    );
  };

  return (
    <>
      {/* Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex lg:hidden items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-2">
        <button onClick={() => prevEntry && goTo(prevEntry.shamelaId)} disabled={!prevEntry}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        {visibleEntries.map((e, i) => navButton(e, i, "sm"))}
        <button onClick={() => nextEntry && goTo(nextEntry.shamelaId)} disabled={!nextEntry}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Desktop */}
      <div className="fixed bottom-0 left-[350px] right-0 z-20 hidden lg:flex items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-4">
        <button onClick={() => prevEntry && goTo(prevEntry.shamelaId)} disabled={!prevEntry}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        {visibleEntries.map((e, i) => navButton(e, i, "md"))}
        <button onClick={() => nextEntry && goTo(nextEntry.shamelaId)} disabled={!nextEntry}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}
