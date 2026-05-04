import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type BookMeta = {
  id: number;
  name: string;
  pagesCount: number;
  authors: { id: number; name: string }[];
  category: { id: number; name: string } | null;
};

type PageData = {
  id: number;
  shamelaId: number;
  content: string;
  foot: string | null;
  part: string | null;
  page: number | null;
  number: string | null;
};

type PagesResponse = {
  items: PageData[];
  total: number;
};

async function fetchBook(id: string): Promise<BookMeta | null> {
  const res = await fetch(`${API}/books/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPage(bookId: string, shamelaId: string): Promise<PageData | null> {
  const res = await fetch(`${API}/books/${bookId}/pages/${shamelaId}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPageByOffset(bookId: string, offset: number): Promise<PageData | null> {
  const res = await fetch(`${API}/books/${bookId}/pages?limit=1&offset=${offset}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data: PagesResponse = await res.json();
  return data.items?.[0] ?? null;
}

async function getPageIndex(bookId: string, shamelaId: number): Promise<number> {
  // Получаем индекс страницы (0-based) через offset поиска
  // Используем API: берём страницы до нужного shamelaId
  const res = await fetch(
    `${API}/books/${bookId}/pages?limit=1&offset=0`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return 0;
  const data: PagesResponse = await res.json();
  // Простой подход: shamelaId ≈ порядковый номер
  // Точный индекс получаем через отдельный запрос
  return shamelaId - (data.items?.[0]?.shamelaId ?? 1);
}

function renderContent(content: string): string {
  return content
    .replace(/<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g,
      '<span class="block font-bold text-[var(--text-1)] text-[19px] mt-6 mb-2">$1</span>')
    .replace(/<hadeeth-(\d+)>/g, '<span class="text-[var(--text-2)]">')
    .replace(/<\/hadeeth-\d+>/g, '</span>')
    .replace(/\n/g, '<br/>');
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string; page: string }>;
}) {
  const { id, page: pageParam } = await params;

  const pageNum = parseInt(pageParam, 10);
  if (isNaN(pageNum) || pageNum < 1) notFound();

  // Загружаем книгу и страницу параллельно
  // page param = shamelaId (1-based номер страницы в книге)
  const [book, pageData] = await Promise.all([
    fetchBook(id),
    fetchPage(id, pageParam),
  ]);

  if (!book) notFound();
  if (!pageData) notFound();

  // Получаем соседние страницы для навигации
  const prevShamelaId = pageNum > 1 ? pageNum - 1 : null;
  const nextShamelaId = pageNum < book.pagesCount ? pageNum + 1 : null;

  const content = renderContent(pageData.content);
  const hasFoot = pageData.foot && pageData.foot.trim().length > 0;

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-[800px] mx-auto px-6">

          {/* Top nav bar */}
          <div className="flex items-center justify-between py-4 border-b border-[var(--border)]">
            {/* Book title */}
            <Link
              href={`/books/${id}`}
              className="flex items-center gap-2 min-w-0 group"
            >
              <ChevronLeft size={14} className="text-[var(--text-3)] flex-shrink-0 group-hover:text-[var(--text-1)] transition-colors" />
              <span
                lang="ar"
                dir="rtl"
                className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)] truncate group-hover:text-[var(--text-1)] transition-colors"
              >
                {book.name}
              </span>
            </Link>

            {/* Page counter */}
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] flex-shrink-0 ml-4">
              {pageNum.toLocaleString("ru")} / {book.pagesCount.toLocaleString("ru")}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-[2px] bg-[var(--border)] -mx-6 mb-0">
            <div
              className="h-full bg-[var(--text-1)] transition-all duration-300"
              style={{ width: `${Math.round((pageNum / book.pagesCount) * 100)}%` }}
            />
          </div>

          {/* Page content */}
          <article className="py-10">
            {/* Part / page number metadata */}
            {(pageData.part || pageData.page) && (
              <div className="flex justify-end mb-6">
                <span className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)]" dir="rtl">
                  {pageData.part && <span>ج{pageData.part} </span>}
                  {pageData.page && <span>ص{pageData.page}</span>}
                </span>
              </div>
            )}

            {/* Main text */}
            <div
              lang="ar"
              dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[19px] leading-[2.1] text-[var(--text-1)]"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Footnotes */}
            {hasFoot && (
              <div className="mt-10 pt-6 border-t border-[var(--border)]">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.14em] text-[var(--text-3)] mb-3">
                  Сноски
                </p>
                <div
                  lang="ar"
                  dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[14px] leading-[1.9] text-[var(--text-3)]"
                  dangerouslySetInnerHTML={{ __html: pageData.foot ?? "" }}
                />
              </div>
            )}
          </article>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between py-5 border-t border-[var(--border)] mb-10">
            {prevShamelaId ? (
              <Link
                href={`/books/${id}/pages/${prevShamelaId}`}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--border)] text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] transition-colors"
              >
                <ChevronLeft size={14} /> Предыдущая
              </Link>
            ) : (
              <span />
            )}

            {/* Page number input */}
            <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[var(--text-3)]">
              {pageNum} / {book.pagesCount}
            </span>

            {nextShamelaId ? (
              <Link
                href={`/books/${id}/pages/${nextShamelaId}`}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--border)] text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] transition-colors"
              >
                Следующая <ChevronRight size={14} />
              </Link>
            ) : (
              <span />
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
