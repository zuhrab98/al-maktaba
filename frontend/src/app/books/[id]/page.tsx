import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChevronRight, BookOpen, Users, Hash } from "lucide-react";
import { toArabic } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type Author   = { id: number; name: string; deathNumber: string | null };
type Category = { id: number; name: string };
type Book     = {
  id: number; name: string; date: string | null;
  bibliography: string | null; hint: string | null;
  betaka: string | null;
  pagesCount: number;
  authors: Author[];
  category: Category | null;
};
type TocItem = { shamelaId: number; page: number | null; title: string };

async function fetchBook(id: string): Promise<Book | null> {
  const res = await fetch(`${API}/books/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchToc(id: string): Promise<TocItem[]> {
  const res = await fetch(`${API}/books/${id}/pages/toc`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchFirstPage(id: string): Promise<number> {
  const res = await fetch(`${API}/books/${id}/pages/page-numbers`);
  if (!res.ok) return 1;
  const entries: { shamelaId: number }[] = await res.json();
  return entries[0]?.shamelaId ?? 1;
}

function validYear(y: string | null): string | null {
  if (!y) return null;
  const n = parseInt(y);
  if (isNaN(n) || n <= 0 || n >= 9999) return null;
  return y;
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, toc, firstPage] = await Promise.all([fetchBook(id), fetchToc(id), fetchFirstPage(id)]);
  if (!book) notFound();

  const year = validYear(book.date);
  const tocPreview = toc.slice(0, 50);
  const tocHasMore = toc.length > 50;

  // Парсим betaka если есть — строки вида "الكتاب: ..." → { label, value }
  const betakaRows: { label: string; value: string }[] = book.betaka
    ? book.betaka.split('\n').flatMap(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          return [{ label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() }];
        }
        if (line.trim()) return [{ label: '', value: line.trim() }];
        return [];
      })
    : [];

  // Fallback строки если betaka нет
  const fallbackRows: { label: string; value: string; arabic?: boolean }[] = [
    { label: "الكتاب", value: book.name, arabic: true },
    ...book.authors.map(a => ({
      label: "المؤلف",
      value: a.name + (validYear(a.deathNumber) ? ` (ت ${toArabic(a.deathNumber)} هـ)` : ""),
      arabic: true,
    })),
    ...(book.category ? [{ label: "التصنيف", value: book.category.name, arabic: true }] : []),
    ...(book.pagesCount > 0 ? [{ label: "عدد الصفحات", value: String(book.pagesCount) }] : []),
    { label: "ترقيم الكتاب", value: "موافق للمطبوع" },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-[var(--bg)]">
        <div className="max-w-[900px] mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 pt-7 pb-5 text-[11px] font-[family-name:var(--font-geist-mono)] text-[var(--text-3)] flex-wrap">
            <Link href="/" className="hover:text-[var(--text-1)] transition-colors">Главная</Link>
            <ChevronRight size={11} strokeWidth={2} />
            <Link href="/catalog" className="hover:text-[var(--text-1)] transition-colors">Каталог</Link>
            {book.category && (
              <>
                <ChevronRight size={11} strokeWidth={2} />
                <Link href={`/catalog?cat=${book.category.id}`} className="hover:text-[var(--text-1)] transition-colors">
                  {book.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* ── Карточка книги ── */}
          <div className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)] overflow-hidden mb-6">

            {/* Шапка */}
            <div className="px-8 pt-8 pb-6 border-b border-[var(--border)]">
              <h1
                lang="ar" dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[28px] font-bold text-[var(--text-1)] leading-[1.5] mb-3"
              >
                {book.name}
              </h1>

              {/* Авторы */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5" dir="rtl">
                {book.authors.map(a => (
                  <Link key={a.id} href={`/authors/${a.id}`}
                    className="inline-flex items-center gap-2 font-[family-name:var(--font-amiri)] text-[16px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                    {a.name}
                    {validYear(a.deathNumber) && (
                      <span className="text-[13px] text-[var(--text-3)]">ت. {toArabic(a.deathNumber)} هـ</span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Пилюли со статистикой */}
              <div className="flex items-center gap-2 flex-wrap">
                {book.pagesCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-2)]">
                    <Hash size={11} className="text-[var(--text-3)]" />
                    {book.pagesCount.toLocaleString("ru")} страниц
                  </span>
                )}
                {year && (
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-2)]" dir="rtl">
                    {toArabic(year)} هـ
                  </span>
                )}
                {book.category && (
                  <Link href={`/catalog?cat=${book.category.id}`}
                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-3,var(--surface-2))] transition-colors"
                    lang="ar" dir="rtl">
                    {book.category.name}
                  </Link>
                )}
              </div>
            </div>

            {/* Сведения об издании — betaka или fallback */}
            <div className="border-b border-[var(--border)]">
              <div className="px-8 py-4">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9.5px] uppercase tracking-[.14em] text-[var(--text-3)] mb-3">
                  Сведения о книге
                </p>
                <dl className="flex flex-col gap-2" dir="rtl">
                  {betakaRows.length > 0
                    ? betakaRows.map((row, i) => (
                        <div key={i} className="flex items-baseline gap-3">
                          {row.label ? (
                            <dt className="font-[family-name:var(--font-amiri)] text-[14px] font-bold text-[var(--text-2)] whitespace-nowrap flex-shrink-0">
                              {row.label}:
                            </dt>
                          ) : null}
                          <dd lang="ar" className={[
                            "font-[family-name:var(--font-amiri)] text-[15px] text-[var(--text-1)] leading-snug",
                            !row.label ? "text-[var(--text-3)] text-[13px]" : "",
                          ].join(" ")}>
                            {row.value}
                          </dd>
                        </div>
                      ))
                    : fallbackRows.map((row, i) => (
                        <div key={i} className="flex items-baseline gap-3">
                          <dt className="font-[family-name:var(--font-amiri)] text-[14px] font-bold text-[var(--text-2)] whitespace-nowrap flex-shrink-0">
                            {row.label}:
                          </dt>
                          <dd lang="ar" className="font-[family-name:var(--font-amiri)] text-[15px] text-[var(--text-1)] leading-snug">
                            {row.value}
                          </dd>
                        </div>
                      ))
                  }
                  {book.authors[0] && (
                    <div className="flex items-baseline gap-3">
                      <dt className="font-[family-name:var(--font-amiri)] text-[14px] font-bold text-[var(--text-2)] whitespace-nowrap flex-shrink-0">
                        صفحة المؤلف:
                      </dt>
                      <dd>
                        <Link href={`/authors/${book.authors[0].id}`}
                          className="font-[family-name:var(--font-amiri)] text-[15px] text-[var(--text-2)] hover:text-[var(--text-1)] underline underline-offset-2 transition-colors"
                          lang="ar">
                          [{book.authors[0].name}]
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Кнопки */}
            <div className="px-8 py-5 flex items-center gap-3">
              <Link href={`/books/${book.id}/pages/${firstPage}`}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-[var(--radius-sm)] bg-[var(--text-1)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
                <BookOpen size={14} />
                Читать книгу
              </Link>
              {book.authors[0] && (
                <Link href={`/authors/${book.authors[0].id}`}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-sm)] border border-[var(--border)] text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors">
                  <Users size={13} />
                  Все книги автора
                </Link>
              )}
            </div>
          </div>

          {/* ── Оглавление ── */}
          {toc.length > 0 && (
            <div className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)] overflow-hidden mb-10">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[.14em] text-[var(--text-3)]">
                  Оглавление
                </h2>
                <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)]">
                  {toc.length.toLocaleString("ru")} разделов
                </span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {tocPreview.map((item, i) => (
                  <Link key={`${item.shamelaId}-${i}`}
                    href={`/books/${book.id}/pages/${item.shamelaId}`}
                    className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-[var(--surface-2)] transition-colors group">
                    <span lang="ar" dir="rtl"
                      className="font-[family-name:var(--font-amiri)] text-[15px] text-[var(--text-1)] leading-snug">
                      {item.title}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] flex-shrink-0 tabular-nums group-hover:text-[var(--text-2)] transition-colors">
                      с. {item.page ?? "—"}
                    </span>
                  </Link>
                ))}

                {tocHasMore && (
                  <Link href={`/books/${book.id}/pages/${firstPage}`}
                    className="flex items-center justify-center px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors">
                    + ещё {(toc.length - 50).toLocaleString("ru")} разделов → открыть в читалке
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
