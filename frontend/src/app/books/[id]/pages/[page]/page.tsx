import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReaderSidebar } from "@/components/reader/reader-sidebar";
import { ReaderNav } from "@/components/reader/reader-nav";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type BookMeta = {
  id: number; name: string; pagesCount: number; chunksCount: number;
  authors: { id: number; name: string }[];
  category: { id: number; name: string } | null;
};
type PageData = {
  id: number; shamelaId: number;
  content: string; foot: string | null;
  part: string | null; page: number | null; number: string | null;
};
type TocItem = { shamelaId: number; title: string };

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
    // Подсветка аятов — текст между ﴿ и ﴾
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

  const [book, pageData, toc] = await Promise.all([
    fetchBook(id),
    fetchPage(id, pageParam),
    fetchToc(id),
  ]);

  if (!book) notFound();
  if (!pageData) notFound();

  const prevId = pageNum > 1 ? pageNum - 1 : null;
  const nextId = pageNum < book.chunksCount ? pageNum + 1 : pageNum;
  const physPage = pageData.page ?? pageNum; // физический номер страницы
  const progress = book.pagesCount > 0 ? (physPage / book.pagesCount) * 100 : 0;
  const content = renderContent(pageData.content);
  const hasFoot = pageData.foot && pageData.foot.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center h-12 px-4 gap-3">
          {/* Back to book */}
          <Link href={`/books/${id}`}
            className="flex items-center gap-1 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors flex-shrink-0">
            <ChevronLeft size={16} strokeWidth={2} />
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] hidden sm:inline">Книга</span>
          </Link>

          <div className="w-px h-4 bg-[var(--border)]" />

          {/* Book title */}
          <Link href={`/books/${id}`} className="flex-1 min-w-0 group">
            <p lang="ar" dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[14px] text-[var(--text-2)] truncate group-hover:text-[var(--text-1)] transition-colors">
              {book.name}
            </p>
          </Link>

          {/* Page counter — физический номер / всего */}
          <span className="flex-shrink-0 font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)]">
            {physPage} / {book.pagesCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-[var(--border)]">
          <div
            className="h-full bg-[var(--text-1)] transition-all duration-500"
            style={{ width: `${progress.toFixed(1)}%` }}
          />
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar (Server component передаёт toc, Client компонент управляет поведением) */}
        <ReaderSidebar bookId={book.id} toc={toc} currentPage={pageNum} />

        {/* ── Page content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-[53px]">
          <div className="max-w-[700px] mx-auto px-6 lg:px-10 py-10">

            {/* Part — показываем только если есть номер тома */}
            {pageData.part && (
              <div className="flex justify-end mb-8" dir="rtl">
                <span className="font-[family-name:var(--font-amiri)] text-[13px] text-[var(--text-3)] border border-[var(--border)] rounded px-2 py-0.5">
                  ج {pageData.part}
                  {pageData.page && <span> · ص {pageData.page}</span>}
                </span>
              </div>
            )}

            {/* Main Arabic text */}
            <article
              id="page-content"
              lang="ar"
              dir="rtl"
              className="font-[family-name:var(--font-amiri)] text-[23px] leading-[2.1] text-[var(--text-1)] [word-spacing:0.05em]"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Footnotes */}
            {hasFoot && (
              <div className="mt-12 pt-6 border-t border-[var(--border)]">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[.14em] text-[var(--text-3)] mb-4">
                  Сноски
                </p>
                <div
                  lang="ar" dir="rtl"
                  className="font-[family-name:var(--font-amiri)] text-[14px] leading-[1.9] text-[var(--text-3)]"
                  dangerouslySetInnerHTML={{ __html: pageData.foot ?? "" }}
                />
              </div>
            )}

          </div>
        </main>

        <ReaderNav
          bookId={book.id}
          prevId={prevId}
          nextId={nextId}
          currentShamelaId={pageNum}
          totalPages={book.chunksCount}
        />
      </div>
    </div>
  );
}
