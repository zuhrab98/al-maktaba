import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { BookList, type Book } from "@/components/catalog/book-list";
import { Pagination } from "@/components/catalog/pagination";

const PER_PAGE = 30;
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type SearchParams = Promise<{ q?: string; sort?: string; cat?: string; page?: string }>;

async function fetchBooks(params: {
  q: string;
  sort: string;
  cat: string;
  page: number;
}): Promise<{ items: Book[]; total: number }> {
  const { q, sort, cat, page } = params;
  const offset = (page - 1) * PER_PAGE;

  const qs = new URLSearchParams();
  qs.set("limit", String(PER_PAGE));
  qs.set("offset", String(offset));
  if (q) qs.set("q", q);
  if (sort) qs.set("sort", sort);
  if (cat) qs.set("categoryId", cat);

  const res = await fetch(`${API}/books?${qs.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return { items: [], total: 0 };

  const data = await res.json();

  const items: Book[] = (data.items ?? []).map((b: {
    id: number;
    name: string;
    authorName?: string;
    categoryName?: string;
    deathNumber?: string;
    pagesCount?: number;
  }) => ({
    id: b.id,
    title: b.name,
    author: b.authorName ?? "",
    deathYear: b.deathNumber ?? "",
    deathYearM: "",
    pages: b.pagesCount ?? 0,
    category: b.categoryName ?? "",
  }));

  return { items, total: data.total ?? 0 };
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q    = sp.q    ?? "";
  const sort = sp.sort ?? "death";
  const cat  = sp.cat  ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const { items, total } = await fetchBooks({ q, sort, cat, page });
  const totalPages = Math.ceil(total / PER_PAGE);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (q)   params.set("q",    q);
    if (sort && sort !== "death") params.set("sort", sort);
    if (cat) params.set("cat",  cat);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/catalog${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <Header activePath="/catalog" />
      <main id="main-content" className="flex-1">
        <div className="max-w-[1280px] mx-auto">

          {/* page head */}
          <div className="px-6 pt-10 pb-6 border-b border-[var(--border)]">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10.5px] text-[var(--text-3)] uppercase tracking-[.14em] mb-2">
              Библиотека
            </p>
            <h1 className="text-[26px] font-semibold tracking-tight text-[var(--text-1)] text-balance">
              Каталог книг
            </h1>
          </div>

          {/* toolbar */}
          <Suspense>
            <CatalogToolbar total={total} />
          </Suspense>

          {/* list */}
          <BookList books={items} />

          {/* pagination */}
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />

        </div>
      </main>
      <Footer />
    </>
  );
}
