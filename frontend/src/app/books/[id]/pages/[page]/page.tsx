import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReaderSidebar } from "@/components/reader/reader-sidebar";
import { ReaderNav } from "@/components/reader/reader-nav";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type BookMeta = {
  id: number; name: string; pagesCount: number;
  authors: { id: number; name: string }[];
  category: { id: number; name: string } | null;
};
type PageData = {
  id: number; shamelaId: number;
  content: string; foot: string | null;
  part: string | null; page: number | null; number: string | null;
};
type TocItem = { shamelaId: number; page: number | null; title: string };

async function fetchBook(id: string): Promise<BookMeta | null> {
  const res = await fetch(`${API}/books/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

// Загружаем страницу по физическому номеру
async function fetchPageByNumber(bookId: string, pageNum: number): Promise<PageData | null> {
  const res = await fetch(`${API}/books/${bookId}/pages/${pageNum}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

// Все физические номера страниц книги
async function fetchPageNumbers(bookId: string): Promise<number[]> {
  const res = await fetch(`${API}/books/${bookId}/pages/page-numbers`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchToc(bookId: string): Promise<TocItem[]> {
  const res = await fetch(`${API}/books/${bookId}/pages/toc`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

function renderContent(content: string): string {
  return content
    .replace(
      /<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g,
      '<strong class="block text-[var(--text-1)] text-[21px] font-bold mt-8 mb-3 leading-snug" style="font-family:var(--font-amiri)">$1</strong>',
    )
    .replace(/<hadeeth-\d+>/g, "")
    .replace(/<\/hadeeth-\d+>/g, "")
    .replace(/(﴿[^﴾]+﴾)/g, '<span class="quran-aya">$1</span>');
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string; page: string }>;
}) {
  const { id, page: pageParam } = await params;

  const pageNum = parseInt(pageParam, 10);
  if (isNaN(pageNum) || pageNum < 1) notFound();

  const [book, pageData, pageNumbers, toc] = await Promise.all([
    fetchBook(id),
    fetchPageByNumber(id, pageNum),
    fetchPageNumbers(id),
    fetchToc(id),
  ]);

  if (!book) notFound();
  if (!pageData) notFound();

  const resolvedPage = pageData;

  const currentPhysPage = resolvedPage.page ?? pageNum;
  const progress = book.pagesCount > 0 ? (currentPhysPage / book.pagesCount) * 100 : 0;
  const content = renderContent(resolvedPage.content);
  const hasFoot = resolvedPage.foot && resolvedPage.foot.trim().length > 0;

  // Используем shamelaId как currentPage для сайдбара
  const currentShamelaId = resolvedPage.shamelaId;

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center h-12 px-4 gap-3">
          <Link href={`/books/${id}`}
            className="flex items-center gap-1 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors flex-shrink-0">
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] hidden sm:inline">Книга</span>
          </Link>

          <div className="w-px h-4 bg-[var(--border)]" />

          <Link href={`/books/${id}`} className="flex-1 min-w-0 group">
            <p lang="ar" dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)] truncate group-hover:text-[var(--text-1)] transition-colors">
              {book.name}
            </p>
          </Link>

          {/* Счётчик: физическая страница / последняя страница */}
          <span className="flex-shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--text-3)] tabular-nums">
            {currentPhysPage} / {book.pagesCount}
          </span>
        </div>

        {/* Progress bar по физическим страницам */}
        <div className="h-[2px] bg-[var(--border)]">
          <div
            className="h-full bg-[var(--text-1)] transition-all duration-500"
            style={{ width: `${progress.toFixed(1)}%` }}
          />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex mt-12">
        <ReaderSidebar bookId={book.id} toc={toc} currentPage={currentShamelaId} />

        <main className="flex-1 min-w-0 pb-[53px]">
          <div className="max-w-[700px] mx-auto px-6 lg:px-10 pt-10 pb-10">

            <article
              lang="ar" dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[23px] leading-[2.1] text-[var(--text-1)] [word-spacing:0.05em]"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {hasFoot && (
              <div className="mt-12 pt-6 border-t border-[var(--border)]">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.14em] text-[var(--text-3)] mb-4">
                  Сноски
                </p>
                <div
                  lang="ar" dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[14px] leading-[1.9] text-[var(--text-3)]"
                  dangerouslySetInnerHTML={{ __html: resolvedPage.foot ?? "" }}
                />
              </div>
            )}

          </div>
        </main>

        <ReaderNav
          bookId={book.id}
          pageNumbers={pageNumbers}
          currentPage={currentPhysPage}
        />
      </div>
    </div>
  );
}
