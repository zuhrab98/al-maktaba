import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

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

  async findOne(bookId: number, shamelaId: number) {
    const page = await this.db.query.pages.findFirst({
      where: and(
        eq(schema.pages.bookId, bookId),
        eq(schema.pages.shamelaId, shamelaId),
      ),
    });
    if (!page) throw new NotFoundException(`Страница не найдена`);
    return page;
  }

  // Извлечение оглавления из span data-type='title' в контенте страниц
  async getToc(bookId: number): Promise<{ shamelaId: number; title: string }[]> {
    const rows = await this.db.execute<{ shamela_id: number; content: string }>(
      sql`SELECT shamela_id, content FROM pages
          WHERE book_id = ${bookId}
            AND content LIKE '%data-type=%title%'
          ORDER BY shamela_id`,
    );

    const toc: { shamelaId: number; title: string }[] = [];
    const titleRe = /<span[^>]+data-type=['"]title['"][^>]*>([^<]+)<\/span>/g;

    for (const row of rows) {
      let m: RegExpExecArray | null;
      titleRe.lastIndex = 0;
      while ((m = titleRe.exec(row.content)) !== null) {
        const title = m[1].trim();
        if (title) toc.push({ shamelaId: row.shamela_id, title });
      }
    }

    return toc;
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
}
