"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Moon, Search, Sun } from "lucide-react";

const NAV = [
  { href: "/",           label: "Главная" },
  { href: "/catalog",    label: "Каталог" },
  { href: "/authors",    label: "Авторы" },
  { href: "/recent",     label: "Недавние" },
  { href: "/me",         label: "Моё" },
];

export function Header({ activePath = "/" }: { activePath?: string }) {
  const [lang, setLang] = useState<"RU" | "EN">("RU");

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 bg-[rgba(249,249,248,.88)] backdrop-blur-md border-b border-[var(--border)]"
    >
      <div className="grid grid-cols-[200px_1fr_200px] items-center h-14 px-6 max-w-[1280px] mx-auto">

        {/* brand */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-1)] tracking-tight"
          translate="no"
        >
          <BookOpen size={15} strokeWidth={1.8} className="text-[var(--text-3)]" aria-hidden />
          al-maktaba
          <span className="font-[family-name:var(--font-amiri)] text-xs text-[var(--text-3)] direction-rtl">
            المكتبة
          </span>
        </Link>

        {/* nav */}
        <nav className="flex justify-center items-center gap-0.5" aria-label="Основная навигация">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "text-[13.5px] px-3 py-1.5 rounded-[var(--radius-sm)]",
                "transition-[color,background-color] duration-150",
                activePath === href
                  ? "text-[var(--text-1)] font-medium"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* util */}
        <div className="flex items-center justify-end gap-1.5">

          {/* search trigger */}
          <button
            aria-label="Поиск (⌘K)"
            className={[
              "inline-flex items-center gap-2 h-8 px-2.5",
              "bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-sm)]",
              "text-xs text-[var(--text-3)] font-[family-name:var(--font-geist-mono)]",
              "transition-[border-color,color] duration-150",
              "hover:border-[var(--border-2)] hover:text-[var(--text-2)]",
              "active:scale-[0.96] transition-[scale] duration-150",
            ].join(" ")}
            touch-action="manipulation"
          >
            <Search size={12} strokeWidth={1.8} aria-hidden />
            <span className="hidden sm:inline text-[11px]">Поиск</span>
            <kbd className="hidden sm:inline font-[family-name:var(--font-geist-mono)] text-[9px] bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm text-[var(--text-3)] ml-1">
              ⌘K
            </kbd>
          </button>

          {/* lang toggle */}
          <div
            role="group"
            aria-label="Язык интерфейса"
            className="inline-flex bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-sm)] p-0.5 gap-px"
          >
            {(["RU", "EN"] as const).map((l) => (
              <button
                key={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={[
                  "h-6 px-2 rounded-[3px]",
                  "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[.06em]",
                  "transition-[background-color,color,box-shadow] duration-150",
                  "active:scale-[0.96]",
                  lang === l
                    ? "bg-[var(--surface)] text-[var(--text-1)] shadow-[0_1px_2px_rgba(0,0,0,.06)]"
                    : "text-[var(--text-3)] hover:text-[var(--text-2)]",
                ].join(" ")}
              >
                {l}
              </button>
            ))}
          </div>

          {/* theme toggle */}
          <button
            aria-label="Переключить тему"
            className={[
              "w-8 h-8 rounded-[var(--radius-sm)]",
              "inline-flex items-center justify-center",
              "text-[var(--text-3)]",
              "transition-[background-color,color] duration-150",
              "hover:bg-[var(--surface-2)] hover:text-[var(--text-2)]",
              "active:scale-[0.96]",
            ].join(" ")}
          >
            <Moon size={14} strokeWidth={1.6} aria-hidden />
          </button>

        </div>
      </div>
    </header>
  );
}
