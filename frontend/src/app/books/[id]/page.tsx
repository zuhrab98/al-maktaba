import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type Author = { id: number; name: string; deathNumber: string | null };
type Category = { id: number; name: string };
type Book = {
  id: number;
  name: string;
  authors: Author[];
  category: Category | null;
  pagesCount: number;
  date: string | null;
  bibliography: string | null;
  hint: string | null;
};
type PageItem = {
  id: number;
  shamelaId: number;
  content: string;
};

async function fetchBook(id: string): Promise<Book | null> {
  const res = await fetch(`${API}/books/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchFirstPages(bookId: string): Promise<PageItem[]> {
  const res = await fetch(`${API}/books/${bookId}/pages?limit=5&offset=0`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

function extractToc(pages: PageItem[]): { shamelaId: number; title: string }[] {
  const toc: { shamelaId: number; title: string }[] = [];
  for (const p of pages) {
    const matches = [...p.content.matchAll(/<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g)];
    for (const m of matches) {
      toc.push({ shamelaId: p.shamelaId, title: m[1].trim() });
    }
  }
  return toc;
}

function cleanPreview(content: string): string {
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, firstPages] = await Promise.all([fetchBook(id), fetchFirstPages(id)]);
  if (!book) notFound();

  const toc = extractToc(firstPages);
  const preview = firstPages[0] ? cleanPreview(firstPages[0].content) : null;

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-[960px] mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 pt-8 pb-6 text-[12px] font-[family-name:var(--font-geist-mono)] text-[var(--text-3)]">
            <Link href="/" className="hover:text-[var(--text-1)] transition-colors">Главная</Link>
            <ChevronRight size={12} />
            <Link href="/catalog" className="hover:text-[var(--text-1)] transition-colors">Каталог</Link>
            <ChevronRight size={12} />
            <span className="text-[var(--text-2)] truncate max-w-[260px]" lang="ar" dir="rtl">{book.name}</span>
          </nav>

          {/* Book header */}
          <div className="pb-8 border-b border-[var(--border)]">
            {book.category && (
              <Link
                href={`/catalog?cat=${book.category.id}`}
                className="inline-block font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[.14em] text-[var(--text-3)] mb-3 hover:text-[var(--text-1)] transition-colors"
              >
                {book.category.name}
              </Link>
            )}

            <h1
              lang="ar"
              dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[32px] font-bold text-[var(--text-1)] leading-snug mb-4"
            >
              {book.name}
            </h1>

            {/* Authors */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6">
              {book.authors.map((a) => (
                <span key={a.id} className="flex items-center gap-2">
                  <span lang="ar" dir="rtl" className="font-[family-name:var(--font-amiri)] text-[17px] text-[var(--text-2)]">
                    {a.name}
                  </span>
                  {a.deathNumber && parseInt(a.deathNumber) > 0 && (
                    <span className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)]" dir="rtl">
                      ت. {a.deathNumber} هـ
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-px overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] w-fit">
              {[
                { label: "Страниц", value: book.pagesCount.toLocaleString("ru") },
                ...(book.date && parseInt(book.date) > 0 && parseInt(book.date) < 9999
                  ? [{ label: "Год (хидж.)", value: book.date + " هـ" }]
                  : []),
                ...(book.category ? [{ label: "Раздел", value: book.category.name }] : []),
              ].map((s, i) => (
                <div key={i} className="px-4 py-2.5 bg-[var(--surface-2)] border-r border-[var(--border)] last:border-r-0">
                  <div className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.12em] text-[var(--text-3)] mb-0.5">
                    {s.label}
                  </div>
                  <div
                    className="font-[family-name:var(--font-geist-mono)] text-[14px] font-medium text-[var(--text-1)]"
                    lang={s.label === "Раздел" ? "ar" : undefined}
                    dir={s.label === "Раздел" ? "rtl" : undefined}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview + Actions */}
          <div className="py-8 border-b border-[var(--border)] grid grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              {preview && (
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[16px] text-[var(--text-2)] leading-[1.9] line-clamp-4"
                >
                  {preview}…
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <Link
                href={`/books/${book.id}/pages/1`}
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-[var(--radius-sm)] bg-[var(--text-1)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Читать книгу →
              </Link>
              <Link
                href={`/catalog?cat=${book.category?.id}`}
                className="flex items-center justify-center h-10 px-5 rounded-[var(--radius-sm)] border border-[var(--border)] text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Все книги раздела
              </Link>
            </div>
          </div>

          {/* TOC or page list */}
          <div className="py-8">
            <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[.14em] text-[var(--text-3)] mb-4">
              {toc.length > 0 ? "Содержание" : "Начало книги"}
            </h2>

            {toc.length > 0 ? (
              <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius)]">
                {toc.map((item, i) => (
                  <Link
                    key={i}
                    href={`/books/${book.id}/pages/${item.shamelaId}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors group"
                  >
                    <span
                      lang="ar"
                      dir="rtl"
                      className="font-[family-name:var(--font-amiri)] text-[15px] text-[var(--text-1)] group-hover:text-[var(--text-1)]"
                    >
                      {item.title}
                    </span>
                    <ChevronRight size={14} className="text-[var(--text-3)] flex-shrink-0 group-hover:text-[var(--text-1)] transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius)]">
                {firstPages.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/books/${book.id}/pages/${p.shamelaId}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors group"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] w-6 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <p
                      lang="ar"
                      dir="rtl"
                      className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)] truncate flex-1"
                    >
                      {cleanPreview(p.content)}
                    </p>
                    <ChevronRight size={14} className="text-[var(--text-3)] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
