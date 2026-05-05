"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type TocItem = { shamelaId: number; title: string };

type Props = {
  bookId: number;
  toc: TocItem[];
  currentPage: number;
};

export function ReaderSidebar({ bookId, toc, currentPage }: Props) {
  // Находим активный пункт — ближайший к текущей странице сверху
  const activeIdx = (() => {
    let idx = 0;
    for (let i = 0; i < toc.length; i++) {
      if (toc[i].shamelaId <= currentPage) idx = i;
      else break;
    }
    return idx;
  })();

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Скролл к активному пункту при смене страницы
  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [currentPage]);

  if (toc.length === 0) return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 h-10 px-4 rounded-full bg-[var(--text-1)] text-white text-[12px] font-[family-name:var(--font-geist-mono)] shadow-lg flex items-center gap-2"
      >
        <span>☰</span> Оглавление
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-[320px] bg-[var(--surface)] h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[.14em] text-[var(--text-3)]">
                Оглавление
              </span>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <TocList toc={toc} bookId={bookId} activeIdx={activeIdx} activeRef={activeRef} onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[350px] flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.16em] text-[var(--text-3)]">
            Оглавление · {toc.length.toLocaleString("ru")}
          </p>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto py-2">
          <TocList toc={toc} bookId={bookId} activeIdx={activeIdx} activeRef={activeRef} />
        </div>
      </aside>
    </>
  );
}

function TocList({
  toc, bookId, activeIdx, activeRef, onNavigate,
}: {
  toc: TocItem[];
  bookId: number;
  activeIdx: number;
  activeRef: React.RefObject<HTMLAnchorElement | null>;
  onNavigate?: () => void;
}) {
  return (
    <nav>
      {toc.map((item, i) => {
        const isActive = i === activeIdx;
        return (
          <Link
            key={`${item.shamelaId}-${i}`}
            href={`/books/${bookId}/pages/${item.shamelaId}`}
            ref={isActive ? (activeRef as React.RefObject<HTMLAnchorElement>) : undefined}
            onClick={onNavigate}
            className={[
              "flex items-start gap-2 px-4 py-2 text-right transition-colors duration-100",
              "border-l-2 border-transparent",
              isActive
                ? "bg-[var(--surface-2)] border-l-[var(--text-1)] text-[var(--text-1)]"
                : "hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)]",
            ].join(" ")}
            dir="rtl"
          >
            <span className={[
              "font-[family-name:var(--font-amiri)] text-[16px] leading-relaxed flex-1 line-clamp-2",
              isActive ? "font-bold" : "",
            ].join(" ")}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
