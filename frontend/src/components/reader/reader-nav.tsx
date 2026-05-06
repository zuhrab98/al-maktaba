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
  currentPart: string | null;
};

export function ReaderNav({ bookId, pages, currentShamelaId, currentPart }: Props) {
  const router = useRouter();

  const currentIdx = pages.findIndex(p => p.shamelaId === currentShamelaId);
  const prevEntry = currentIdx > 0 ? pages[currentIdx - 1] : null;
  const nextEntry = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null;

  const goTo = (shamelaId: number) => {
    window.scrollTo(0, 0);
    router.push(`/books/${bookId}/pages/${shamelaId}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" && nextEntry) { e.preventDefault(); goTo(nextEntry.shamelaId); }
      else if (e.key === "ArrowLeft" && prevEntry) { e.preventDefault(); goTo(prevEntry.shamelaId); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookId, prevEntry, nextEntry, router]);

  // Страницы текущего тома для пагинации
  const volumePages = currentPart
    ? pages.filter(p => p.part === currentPart)
    : pages;

  const volumeIdx = volumePages.findIndex(p => p.shamelaId === currentShamelaId);
  const total = volumePages.length;

  // Строим видимые кнопки: первая, соседи текущей, последняя
  const visible: (PageEntry | "…")[] = [];
  const add = (idx: number) => {
    if (idx < 0 || idx >= total) return;
    const e = volumePages[idx];
    if (visible.some(v => v !== "…" && (v as PageEntry).shamelaId === e.shamelaId)) return;
    visible.push(e);
  };

  add(0);
  if (volumeIdx - 3 > 1) visible.push("…");
  add(volumeIdx - 2);
  add(volumeIdx - 1);
  add(volumeIdx);
  add(volumeIdx + 1);
  add(volumeIdx + 2);
  if (volumeIdx + 3 < total - 2) visible.push("…");
  add(total - 1);

  // Метка кнопки — физическая страница тома или shamelaId если нет page
  const btnLabel = (e: PageEntry) => String(e.page ?? e.shamelaId);

  const btn = (e: PageEntry | "…", i: number, sm: boolean) => {
    if (e === "…") return (
      <span key={`ell-${i}`} className={`flex items-center justify-center font-[family-name:var(--font-geist-mono)] text-[var(--text-3)] select-none w-8 ${sm ? "text-[11px]" : "text-[12px]"}`}>···</span>
    );
    const active = e.shamelaId === currentShamelaId;
    return (
      <button key={e.shamelaId} onClick={() => goTo(e.shamelaId)}
        className={[
          "h-8 flex items-center justify-center rounded-[var(--radius-sm)] tabular-nums transition-colors font-[family-name:var(--font-geist-mono)]",
          sm ? "min-w-[28px] px-1.5 text-[11px]" : "min-w-[32px] px-2 text-[12px]",
          active ? "bg-[var(--text-1)] text-white font-medium" : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]",
        ].join(" ")}>
        {btnLabel(e)}
      </button>
    );
  };

  const chevronCls = "w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <>
      {/* Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex lg:hidden items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-2">
        <button onClick={() => prevEntry && goTo(prevEntry.shamelaId)} disabled={!prevEntry} className={chevronCls}>
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        {visible.map((e, i) => btn(e, i, true))}
        <button onClick={() => nextEntry && goTo(nextEntry.shamelaId)} disabled={!nextEntry} className={chevronCls}>
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Desktop */}
      <div className="fixed bottom-0 left-[350px] right-0 z-20 hidden lg:flex items-center justify-center gap-1 h-[52px] bg-[var(--surface)] border-t border-[var(--border)] px-4">
        <button onClick={() => prevEntry && goTo(prevEntry.shamelaId)} disabled={!prevEntry} className={chevronCls}>
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        {visible.map((e, i) => btn(e, i, false))}
        <button onClick={() => nextEntry && goTo(nextEntry.shamelaId)} disabled={!nextEntry} className={chevronCls}>
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}
