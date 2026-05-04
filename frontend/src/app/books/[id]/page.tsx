import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChevronRight, BookOpen, Users, Calendar, Hash } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type Author   = { id: number; name: string; deathNumber: string | null };
type Category = { id: number; name: string };
type Book     = {
  id: number; name: string; date: string | null;
  bibliography: string | null; hint: string | null;
  pagesCount: number;
  authors: Author[];
  category: Category | null;
};
type TocItem = { shamelaId: number; title: string };

async function fetchBook(id: string): Promise<Book | null> {
  const res = await fetch(`${API}/books/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchToc(id: string): Promise<TocItem[]> {
  const res = await fetch(`${API}/books/${id}/pages/toc`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

// Парсим строку библиографии вида "الكتاب: ...\nالمؤلف: ..."
function parseBiblio(raw: string | null): Record<string, string> {
  if (!raw) return {};
  const map: Record<string, string> = {};
  for (const line of raw.split(/\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) map[key] = val;
    }
  }
  return map;
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, toc] = await Promise.all([fetchBook(id), fetchToc(id)]);
  if (!book) notFound();

  const biblio = parseBiblio(book.bibliography);

  // Показываем первые 50 заголовков в оглавлении на этой странице
  const tocPreview = toc.slice(0, 50);
  const tocHasMore = toc.length > 50;

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-[var(--bg)]">
        <div className="max-w-[1024px] mx-auto px-6">

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

          {/* ── Main card ── */}
          <div className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)] overflow-hidden mb-6">

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-[var(--border)]">
              <h1 lang="ar" dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[28px] font-bold text-[var(--text-1)] leading-[1.5] mb-3">
                {book.name}
              </h1>

              {/* Authors */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-5" dir="rtl">
                {book.authors.map((a) => (
                  <Link key={a.id} href={`/authors/${a.id}`}
                    className="inline-flex items-center gap-2 font-[family-name:var(--font-amiri)] text-[16px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                    {a.name}
                    {a.deathNumber && parseInt(a.deathNumber) > 0 && parseInt(a.deathNumber) < 9999 && (
                      <span className="text-[13px] text-[var(--text-3)]">ت. {a.deathNumber} هـ</span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {book.pagesCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-2)]">
                    <Hash size={11} className="text-[var(--text-3)]" />
                    {book.pagesCount.toLocaleString("ru")} страниц
                  </span>
                )}
                {book.date && parseInt(book.date) > 0 && parseInt(book.date) < 9999 && (
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-2)]">
                    <Calendar size={11} className="text-[var(--text-3)]" />
                    {book.date} هـ
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

            {/* Bibliography table */}
            {Object.keys(biblio).length > 0 && (
              <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--surface-2)]">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9.5px] uppercase tracking-[.14em] text-[var(--text-3)] mb-3">
                  Сведения об издании
                </p>
                <dl className="grid gap-y-2" dir="rtl">
                  {Object.entries(biblio).map(([key, val]) => (
                    <div key={key} className="flex gap-3 items-baseline">
                      <dt className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)] whitespace-nowrap flex-shrink-0 min-w-[100px]">
                        {key}:
                      </dt>
                      <dd className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-1)] leading-snug">
                        {val}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* CTA */}
            <div className="px-8 py-5 flex items-center gap-3">
              <Link href={`/books/${book.id}/pages/1`}
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

          {/* ── Table of contents ── */}
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
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--text-3)] flex-shrink-0 group-hover:text-[var(--text-2)] transition-colors">
                      с. {item.shamelaId}
                    </span>
                  </Link>
                ))}

                {tocHasMore && (
                  <div className="px-6 py-4 text-center">
                    <Link href={`/books/${book.id}/pages/1`}
                      className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
                      + ещё {(toc.length - 50).toLocaleString("ru")} разделов → открыть в читалке
                    </Link>
                  </div>
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
