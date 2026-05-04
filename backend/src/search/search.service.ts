import { Inject, Injectable } from '@nestjs/common';
import { ilike, or, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class SearchService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async search(query: string, limit = 20, offset = 0) {
    const bookWhere = ilike(schema.books.name, `%${query}%`);
    const authorWhere = ilike(schema.authors.name, `%${query}%`);

    const [books, authors, total] = await Promise.all([
      this.db
        .select({
          id: schema.books.id,
          name: schema.books.name,
          categoryId: schema.books.categoryId,
          pagesCount: schema.books.pagesCount,
          date: schema.books.date,
        })
        .from(schema.books)
        .where(bookWhere)
        .limit(limit)
        .offset(offset),

      this.db
        .select({ id: schema.authors.id, name: schema.authors.name })
        .from(schema.authors)
        .where(authorWhere)
        .limit(10),

      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.books)
        .where(bookWhere)
        .then((r) => Number(r[0].count)),
    ]);

    return { books, authors, total, limit, offset, query };
  }
}
