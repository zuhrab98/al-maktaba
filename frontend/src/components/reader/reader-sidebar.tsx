"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type TocNode = {
  shamelaId: number;
  pageShamelaId: number;
  page: number | null;
  title: string;
  children: TocNode[];
};

type Props = {
  bookId: number;
  tocTree: TocNode[];
  currentPage: number; // shamelaId текущей страницы
};

// Находим активный узел — ближайший к currentPage сверху (по shamelaId)
function findActiveShamelaId(nodes: TocNode[], currentPage: number): number {
  let best = -1;
  function walk(ns: TocNode[]) {
    for (const n of ns) {
      if (n.pageShamelaId <= currentPage) best = n.shamelaId;
      walk(n.children);
    }
  }
  walk(nodes);
  return best;
}

// Находим всех предков активного узла (для авто-раскрытия)
function findAncestors(nodes: TocNode[], targetShamelaId: number): Set<number> {
  const ancestors = new Set<number>();
  function walk(ns: TocNode[], path: number[]): boolean {
    for (const n of ns) {
      if (n.shamelaId === targetShamelaId) {
        path.forEach(id => ancestors.add(id));
        return true;
      }
      if (walk(n.children, [...path, n.shamelaId])) return true;
    }
    return false;
  }
  walk(nodes, []);
  return ancestors;
}

// Подсчёт всех узлов в дереве
function countNodes(nodes: TocNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

export function ReaderSidebar({ bookId, tocTree, currentPage }: Props) {
  const activeShamelaId = findActiveShamelaId(tocTree, currentPage);
  const ancestors = findAncestors(tocTree, activeShamelaId);

  // Раскрытые узлы = предки активного + сам активный
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([...ancestors, activeShamelaId]));
  const [isOpen, setIsOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // При смене страницы — раскрываем путь к активному и скроллим к нему
  useEffect(() => {
    const newAncestors = findAncestors(tocTree, activeShamelaId);
    setExpanded(prev => new Set([...prev, ...newAncestors, activeShamelaId]));
  }, [activeShamelaId]);

  useEffect(() => {
    if (!activeRef.current || !listRef.current) return;
    const container = listRef.current;
    const item = activeRef.current;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (itemTop < containerTop || itemBottom > containerBottom) {
      container.scrollTop = itemTop - container.clientHeight / 2 + item.offsetHeight / 2;
    }
  }, [activeShamelaId]);

  if (tocTree.length === 0) return null;

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCount = countNodes(tocTree);

  const treeProps = { bookId, activeShamelaId, activeRef, expanded, toggle, onNavigate: undefined as (() => void) | undefined };

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
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] text-lg leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <TocTree nodes={tocTree} depth={0} {...treeProps} onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[350px] flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.16em] text-[var(--text-3)]">
            Оглавление · {totalCount.toLocaleString("ru")}
          </p>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto py-2">
          <TocTree nodes={tocTree} depth={0} {...treeProps} />
        </div>
      </aside>
    </>
  );
}

function TocTree({
  nodes, depth, bookId, activeShamelaId, activeRef, expanded, toggle, onNavigate,
}: {
  nodes: TocNode[];
  depth: number;
  bookId: number;
  activeShamelaId: number;
  activeRef: React.RefObject<HTMLAnchorElement | null>;
  expanded: Set<number>;
  toggle: (id: number) => void;
  onNavigate?: () => void;
}) {
  return (
    <nav>
      {nodes.map(node => {
        const isActive = node.shamelaId === activeShamelaId;
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded.has(node.shamelaId);
        const href = `/books/${bookId}/pages/${node.page ?? node.pageShamelaId}`;

        return (
          <div key={node.shamelaId}>
            <div
              className={[
                "flex items-center gap-1 pr-2 transition-colors duration-100",
                "border-l-2",
                isActive
                  ? "bg-[var(--surface-2)] border-l-[var(--text-1)]"
                  : "border-transparent hover:bg-[var(--surface-2)]",
              ].join(" ")}
              style={{ paddingRight: `${8 + depth * 12}px` }}
            >
              {/* Кнопка раскрытия */}
              {hasChildren ? (
                <button
                  onClick={() => toggle(node.shamelaId)}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
                  dir="ltr"
                >
                  <span className={["text-[10px] transition-transform duration-150", isExpanded ? "rotate-90" : ""].join(" ")}>▶</span>
                </button>
              ) : (
                <span className="flex-shrink-0 w-5 h-5" />
              )}

              {/* Ссылка */}
              <Link
                href={href}
                ref={isActive ? (activeRef as React.RefObject<HTMLAnchorElement>) : undefined}
                onClick={() => { window.scrollTo(0, 0); onNavigate?.(); }}
                className={[
                  "flex-1 py-2 text-right",
                  isActive ? "text-[var(--text-1)]" : "text-[var(--text-2)] hover:text-[var(--text-1)]",
                ].join(" ")}
                dir="rtl"
              >
                <span className={[
                  "font-[family-name:var(--font-amiri)] text-[15px] leading-relaxed line-clamp-2",
                  isActive ? "font-bold" : "",
                  depth === 0 ? "text-[16px]" : "",
                ].join(" ")}>
                  {node.title || "—"}
                </span>
              </Link>
            </div>

            {/* Дочерние узлы */}
            {hasChildren && isExpanded && (
              <TocTree
                nodes={node.children}
                depth={depth + 1}
                bookId={bookId}
                activeShamelaId={activeShamelaId}
                activeRef={activeRef}
                expanded={expanded}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
