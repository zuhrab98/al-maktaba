import { Inject, Injectable } from '@nestjs/common';
import { eq, ilike, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class AuthorsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll(limit = 50, offset = 0) {
    return this.db.query.authors.findMany({
      limit,
      offset,
      orderBy: (a, { asc }) => [asc(a.name)],
    });
  }

  findOne(id: number) {
    return this.db.query.authors.findFirst({
      where: eq(schema.authors.id, id),
    });
  }

  search(query: string, limit = 20) {
    return this.db
      .select()
      .from(schema.authors)
      .where(ilike(schema.authors.name, `%${query}%`))
      .limit(limit)
      .orderBy(schema.authors.name);
  }

  findBooksByAuthor(authorId: number, limit = 20, offset = 0) {
    return this.db
      .select({
        id: schema.books.id,
        name: schema.books.name,
        categoryId: schema.books.categoryId,
        pagesCount: schema.books.pagesCount,
        date: schema.books.date,
      })
      .from(schema.books)
      .innerJoin(
        schema.bookAuthors,
        eq(schema.bookAuthors.bookId, schema.books.id),
      )
      .where(eq(schema.bookAuthors.authorId, authorId))
      .limit(limit)
      .offset(offset)
      .orderBy(schema.books.name);
  }

  count() {
    return this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.authors)
      .then((r) => r[0].count);
  }
}
