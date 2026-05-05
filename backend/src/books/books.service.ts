import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, ilike, and, sql, asc, desc } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class BooksService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async findAll(
    limit = 30,
    offset = 0,
    categoryId?: number,
    sort: 'name' | 'death' | 'pages' = 'name',
    q?: string,
  ) {
    const conditions = [];
    if (categoryId) conditions.push(eq(schema.books.categoryId, categoryId));
    if (q) conditions.push(ilike(schema.books.name, `%${q}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy =
      sort === 'pages'
        ? desc(schema.books.pagesCount)
        : sort === 'death'
          ? asc(schema.authors.deathNumber)
          : asc(schema.books.name);

    const [items, totalRows] = await Promise.all([
      this.db
        .select({
          id: schema.books.id,
          name: schema.books.name,
          categoryId: schema.books.categoryId,
          categoryName: schema.categories.name,
          authorId: schema.authors.id,
          authorName: schema.authors.name,
          deathNumber: schema.authors.deathNumber,
          date: schema.books.date,
          pagesCount: schema.books.pagesCount,
        })
        .from(schema.books)
        .leftJoin(schema.categories, eq(schema.books.categoryId, schema.categories.id))
        .leftJoin(schema.bookAuthors, eq(schema.bookAuthors.bookId, schema.books.id))
        .leftJoin(schema.authors, eq(schema.bookAuthors.authorId, schema.authors.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(distinct ${schema.books.id})` })
        .from(schema.books)
        .leftJoin(schema.bookAuthors, eq(schema.bookAuthors.bookId, schema.books.id))
        .leftJoin(schema.authors, eq(schema.bookAuthors.authorId, schema.authors.id))
        .where(where)
        .then((r) => Number(r[0].count)),
    ]);

    return { items, total: totalRows, limit, offset };
  }

  async findOne(id: number) {
    const book = await this.db.query.books.findFirst({
      where: eq(schema.books.id, id),
    });
    if (!book) throw new NotFoundException(`Книга #${id} не найдена`);

    const [authors, chunksCount] = await Promise.all([
      this.db
        .select({ id: schema.authors.id, name: schema.authors.name, deathNumber: schema.authors.deathNumber })
        .from(schema.authors)
        .innerJoin(schema.bookAuthors, eq(schema.bookAuthors.authorId, schema.authors.id))
        .where(eq(schema.bookAuthors.bookId, id)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.pages)
        .where(eq(schema.pages.bookId, id))
        .then(r => Number(r[0].count)),
    ]);

    const category = book.categoryId
      ? await this.db.query.categories.findFirst({
          where: eq(schema.categories.id, book.categoryId),
        })
      : null;

    return { ...book, authors, category, chunksCount };
  }

  async findTitles(bookId: number) {
    return this.db.query.titles.findMany({
      where: eq(schema.titles.bookId, bookId),
      orderBy: (t, { asc }) => [asc(t.id)],
    });
  }

  async search(query: string, limit = 20, offset = 0) {
    const where = ilike(schema.books.name, `%${query}%`);
    const [items, total] = await Promise.all([
      this.db
        .select({
          id: schema.books.id,
          name: schema.books.name,
          categoryId: schema.books.categoryId,
          date: schema.books.date,
          pagesCount: schema.books.pagesCount,
        })
        .from(schema.books)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(schema.books.name),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.books)
        .where(where)
        .then((r) => Number(r[0].count)),
    ]);
    return { items, total, limit, offset };
  }
}
