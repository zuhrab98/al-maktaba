import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

export type TocNode = {
  shamelaId: number;
  pageShamelaId: number;
  page: number | null;
  title: string;
  children: TocNode[];
};

@Injectable()
export class PagesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async findByBook(bookId: number, limit = 1, offset = 0) {
    const [items, total] = await Promise.all([
      this.db.query.pages.findMany({
        where: eq(schema.pages.bookId, bookId),
        limit,
        offset,
        orderBy: (p, { asc }) => [asc(p.shamelaId)],
        columns: { id: true, shamelaId: true, part: true, page: true, number: true, content: true },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.pages)
        .where(eq(schema.pages.bookId, bookId))
        .then((r) => Number(r[0].count)),
    ]);
    return { items, total, limit, offset };
  }

  async findOne(bookId: number, pageNum: number) {
    // Для однотомных книг URL содержит физическую страницу, для многотомных — shamelaId.
    // Ищем сначала по shamelaId, затем по физической странице как fallback.
    const byShamelaId = await this.db.query.pages.findFirst({
      where: and(
        eq(schema.pages.bookId, bookId),
        eq(schema.pages.shamelaId, pageNum),
      ),
    });
    if (byShamelaId) return byShamelaId;

    const byPage = await this.db.query.pages.findFirst({
      where: and(
        eq(schema.pages.bookId, bookId),
        eq(schema.pages.page, pageNum),
      ),
    });
    if (!byPage) throw new NotFoundException(`Страница не найдена`);
    return byPage;
  }

  // Извлечение оглавления из span data-type='title' в контенте страниц
  async getToc(bookId: number): Promise<{ shamelaId: number; page: number | null; title: string }[]> {
    const rows = await this.db.execute<{ shamela_id: number; page: number | null; content: string }>(
      sql`SELECT shamela_id, page, content FROM pages
          WHERE book_id = ${bookId}
            AND content LIKE '%data-type=%title%'
          ORDER BY shamela_id`,
    );

    const toc: { shamelaId: number; page: number | null; title: string }[] = [];
    const titleRe = /<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g;

    for (const row of rows) {
      let m: RegExpExecArray | null;
      titleRe.lastIndex = 0;
      while ((m = titleRe.exec(row.content)) !== null) {
        const title = m[1].trim();
        if (title) toc.push({ shamelaId: row.shamela_id, page: row.page, title });
      }
    }

    return toc;
  }

  // Иерархическое оглавление из таблицы titles + текст из pages.content
  async getTocTree(bookId: number): Promise<TocNode[]> {
    const rows = await this.db.execute<{
      shamela_id: number;
      page_shamela_id: number;
      parent_shamela_id: number | null;
      phys_page: number | null;
    }>(
      sql`SELECT t.shamela_id, t.page_shamela_id, t.parent_shamela_id, p.page as phys_page
          FROM titles t
          LEFT JOIN pages p ON p.book_id = t.book_id AND p.shamela_id = t.page_shamela_id
          WHERE t.book_id = ${bookId}
          ORDER BY t.shamela_id`,
    );

    if (rows.length === 0) return [];

    // Получаем тексты заголовков из страниц которые содержат title span
    const pageIds = [...new Set(rows.map(r => r.page_shamela_id))];
    const contentRows = await this.db.execute<{ shamela_id: number; content: string }>(
      sql`SELECT shamela_id, content FROM pages
          WHERE book_id = ${bookId}
            AND shamela_id = ANY(${sql.raw(`ARRAY[${pageIds.join(',')}]`)}::int[])
            AND content LIKE '%data-type=%title%'`,
    );

    // Карта shamelaId → список заголовков на этой странице
    const titleRe = /<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g;
    const titleMap = new Map<number, string[]>();
    for (const row of contentRows) {
      const titles: string[] = [];
      titleRe.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = titleRe.exec(row.content)) !== null) {
        const t = m[1].trim();
        if (t) titles.push(t);
      }
      if (titles.length) titleMap.set(row.shamela_id, titles);
    }

    // Строим карту id → node и назначаем текст
    // Если на одной странице несколько заголовков — берём по порядку shamela_id
    const pageCounter = new Map<number, number>();
    const nodeMap = new Map<number, TocNode>();

    for (const row of rows) {
      const counter = pageCounter.get(row.page_shamela_id) ?? 0;
      const titles = titleMap.get(row.page_shamela_id) ?? [];
      const title = titles[counter] ?? '';
      pageCounter.set(row.page_shamela_id, counter + 1);

      nodeMap.set(row.shamela_id, {
        shamelaId: row.shamela_id,
        pageShamelaId: row.page_shamela_id,
        page: row.phys_page,
        title,
        children: [],
      });
    }

    // Строим дерево
    const roots: TocNode[] = [];
    for (const row of rows) {
      const node = nodeMap.get(row.shamela_id)!;
      if (row.parent_shamela_id && nodeMap.has(row.parent_shamela_id)) {
        nodeMap.get(row.parent_shamela_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findByPageNumber(bookId: number, pageNumber: number) {
    const page = await this.db.query.pages.findFirst({
      where: and(
        eq(schema.pages.bookId, bookId),
        eq(schema.pages.page, pageNumber),
      ),
    });
    if (!page) throw new NotFoundException(`Страница ${pageNumber} не найдена`);
    return page;
  }

  // Список страниц для навигации в читалке.
  // Возвращает {shamelaId, page, part} — для построения пагинации по физическим страницам внутри тома.
  async getPageNumbers(bookId: number): Promise<{ shamelaId: number; page: number | null; part: string | null }[]> {
    const rows = await this.db.execute<{ shamela_id: number; page: number | null; part: string | null }>(
      sql`SELECT shamela_id, page, part FROM pages
          WHERE book_id = ${bookId}
          ORDER BY shamela_id`,
    );
    return rows.map(r => ({ shamelaId: r.shamela_id, page: r.page, part: r.part }));
  }
}
