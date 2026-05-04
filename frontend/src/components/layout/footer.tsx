import Link from "next/link";

const LINKS = [
  { href: "/about",    label: "О проекте" },
  { href: "/catalog",  label: "Каталог" },
  { href: "/authors",  label: "Авторы" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-7 flex items-center justify-between gap-6">
        {/* left */}
        <div className="flex items-center gap-3">
          <span
            className="text-[13px] text-[var(--text-3)]"
            translate="no"
          >
            al-maktaba
          </span>
          <span className="w-px h-3.5 bg-[var(--border)]" aria-hidden />
          <span
            dir="rtl"
            className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)]"
          >
            المكتبة الشاملة
          </span>
          <span className="w-px h-3.5 bg-[var(--border)]" aria-hidden />
          <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] tracking-[.04em]">
            некоммерческий проект
          </span>
        </div>

        {/* right */}
        <nav className="flex items-center gap-4" aria-label="Ссылки футера">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] uppercase tracking-[.08em] hover:text-[var(--text-2)] transition-[color] duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
