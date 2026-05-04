"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import { useRef } from "react";

const SORT_OPTIONS = [
  { value: "death", label: "По году смерти" },
  { value: "alpha", label: "По алфавиту" },
  { value: "pages", label: "По объёму" },
];

const CATS = [
  { id: "",   label: "Все разделы",  ar: false },
  { id: "1",  label: "العقيدة",      ar: true },
  { id: "6",  label: "الحديث",       ar: true },
  { id: "2",  label: "الفقه",        ar: true },
  { id: "4",  label: "التفسير",      ar: true },
  { id: "9",  label: "التاريخ",      ar: true },
  { id: "3",  label: "اللغة",        ar: true },
  { id: "7",  label: "التصوف",       ar: true },
  { id: "10", label: "الفتاوى",      ar: true },
];

export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q    = params.get("q")    ?? "";
  const sort = params.get("sort") ?? "death";
  const cat  = params.get("cat")  ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update("q", value), 300);
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex-wrap">

      {/* search */}
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search
          size={13}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoComplete="off"
          spellCheck={false}
          placeholder="Поиск книг и авторов…"
          aria-label="Поиск по каталогу"
          onChange={(e) => handleSearch(e.target.value)}
          className={[
            "w-full h-8 pl-8 pr-3",
            "bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)]",
            "text-[13px] text-[var(--text-1)] placeholder:text-[var(--text-3)]",
            "outline-none",
            "transition-[border-color,box-shadow] duration-150",
            "focus:border-[var(--border-2)] focus:shadow-[0_0_0_2px_rgba(10,10,9,.06)]",
          ].join(" ")}
        />
      </div>

      {/* category pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {CATS.map(({ id, label, ar }) => (
          <button
            key={id}
            onClick={() => update("cat", id)}
            className={[
              "h-7 px-2.5 rounded-full",
              "border transition-[background-color,border-color,color,scale] duration-150",
              "active:scale-[0.96]",
              "touch-action-manipulation",
              ar
                ? "font-[family-name:var(--font-amiri)] text-[13px]"
                : "font-[family-name:var(--font-geist-sans)] text-[12px]",
              cat === id
                ? "bg-[var(--text-1)] text-white border-[var(--text-1)]"
                : "bg-[var(--surface)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* sort */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown size={12} strokeWidth={1.8} className="text-[var(--text-3)]" aria-hidden />
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          aria-label="Сортировка"
          style={{ backgroundColor: "var(--surface)", color: "var(--text-2)" }}
          className={[
            "h-8 pl-2.5 pr-6 appearance-none",
            "border border-[var(--border)] rounded-[var(--radius-sm)]",
            "font-[family-name:var(--font-geist-mono)] text-[11px]",
            "outline-none cursor-pointer",
            "transition-[border-color] duration-150 hover:border-[var(--border-2)]",
          ].join(" ")}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* total */}
      <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] tabular-nums whitespace-nowrap">
        {total.toLocaleString("ru")} книг
      </span>

    </div>
  );
}
