import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

interface V4Category { category_id: number; category_name: string; category_order: number }
interface V4Author { author_id: number; author_name: string; death_number?: string; death_text?: string }
interface V4Book { book_id: number; book_name: string; book_category: number; authors: string; book_date?: string }
interface V4AuthorBook { author_id: number; book_id: number }
interface V4Page { id: number; part?: string; page?: string; number?: string }
interface V4Title { id: number; page?: number; parent?: number; tit?: string }

const BATCH = 500;

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async importFromISO(dbPath: string): Promise<{ message: string }> {
    const masterPath = path.join(dbPath, 'master.db');
    if (!fs.existsSync(masterPath)) {
      throw new Error(`master.db не найден: ${masterPath}`);
    }

    this.logger.log('Импорт метаданных из Shamela v4...');
    const master = new Database(masterPath, { readonly: true });

    try {
      await this.importCategories(master);
      await this.importAuthors(master);
      await this.importBooks(master);
      await this.importAuthorBook(master);
    } finally {
      master.close();
    }

    this.logger.log('Импорт метаданных завершён.');
    return { message: 'Импорт завершён' };
  }

  private async importCategories(master: Database.Database) {
    const rows = (master
      .prepare('SELECT category_id, category_name, category_order FROM category')
      .all() as V4Category[])
      .filter((r) => r.category_name && r.category_name !== '#');

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.categories)
        .values(rows.slice(i, i + BATCH).map((r) => ({
          id: r.category_id,
          name: r.category_name,
          order: parseInt(String(r.category_order)) || 0,
        })))
        .onConflictDoUpdate({
          target: schema.categories.id,
          set: { name: sql`excluded.name`, order: sql`excluded.order` },
        });
    }
    this.logger.log(`Категорий: ${rows.length}`);
  }

  private async importAuthors(master: Database.Database) {
    const rows = master
      .prepare('SELECT author_id, author_name, death_number, death_text FROM author')
      .all() as V4Author[];

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.authors)
        .values(rows.slice(i, i + BATCH).map((r) => ({
          id: r.author_id,
          name: r.author_name,
          biography: null,
          deathNumber: r.death_number ?? null,
          deathText: r.death_text ?? null,
        })))
        .onConflictDoUpdate({
          target: schema.authors.id,
          set: { name: sql`excluded.name`, deathNumber: sql`excluded.death_number`, deathText: sql`excluded.death_text` },
        });
    }
    this.logger.log(`Авторов: ${rows.length}`);
  }

  private async importBooks(master: Database.Database) {
    const rows = master
      .prepare('SELECT book_id, book_name, book_category, authors, book_date FROM book WHERE hidden = 0')
      .all() as V4Book[];

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.books)
        .values(rows.slice(i, i + BATCH).map((r) => {
          const authorIds = r.authors
            ? r.authors.split(',').map((a) => parseInt(a.trim())).filter(Boolean)
            : [];
          return {
            id: r.book_id,
            name: r.book_name,
            categoryId: r.book_category || null,
            authorIds,
            date: r.book_date ?? null,
            bibliography: null,
            hint: null,
            metadata: null,
            pdfLinks: null,
            printed: false,
            type: null,
          };
        }))
        .onConflictDoUpdate({
          target: schema.books.id,
          set: { name: sql`excluded.name`, categoryId: sql`excluded.category_id` },
        });
    }
    this.logger.log(`Книг: ${rows.length}`);
  }

  private async importAuthorBook(master: Database.Database) {
    const rows = master
      .prepare('SELECT author_id, book_id FROM author_book')
      .all() as V4AuthorBook[];

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.bookAuthors)
        .values(rows.slice(i, i + BATCH).map((r) => ({
          bookId: r.book_id,
          authorId: r.author_id,
        })))
        .onConflictDoNothing();
    }
    this.logger.log(`Связей автор-книга: ${rows.length}`);
  }

  // Импорт оглавлений из book/NNN/{id}.db (без текста страниц)
  async importTitlesFromBookDir(dbPath: string): Promise<{ message: string }> {
    const bookDir = path.join(dbPath, 'book');
    if (!fs.existsSync(bookDir)) throw new Error(`Папка book не найдена: ${bookDir}`);

    let total = 0;
    const subdirs = fs.readdirSync(bookDir);

    for (const sub of subdirs) {
      const subPath = path.join(bookDir, sub);
      if (!fs.statSync(subPath).isDirectory()) continue;

      const files = fs.readdirSync(subPath).filter((f) => f.endsWith('.db'));
      for (const file of files) {
        const bookId = parseInt(path.basename(file, '.db'));
        if (isNaN(bookId)) continue;
        try {
          const bdb = new Database(path.join(subPath, file), { readonly: true });
          await this.importTitles(bdb, bookId);
          await this.importPagesMeta(bdb, bookId);
          bdb.close();
          total++;
          if (total % 500 === 0) this.logger.log(`Оглавления: ${total} книг...`);
        } catch { /* пропускаем повреждённые */ }
      }
    }

    this.logger.log(`Оглавления импортированы: ${total} книг`);
    return { message: `Оглавления: ${total} книг` };
  }

  private async importPagesMeta(bdb: Database.Database, bookId: number) {
    let rows: V4Page[] = [];
    try {
      rows = bdb.prepare('SELECT id, part, page, number FROM page').all() as V4Page[];
    } catch { return; }

    if (rows.length === 0) return;

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.pages)
        .values(rows.slice(i, i + BATCH).map((r) => ({
          bookId,
          shamelaId: r.id,
          content: '',
          part: r.part ?? null,
          page: r.page != null ? parseInt(String(r.page)) : null,
          number: r.number ?? null,
        })))
        .onConflictDoNothing();
    }

    await this.db.execute(
      sql`UPDATE books SET pages_count = (SELECT COUNT(*) FROM pages WHERE book_id = ${bookId}) WHERE id = ${bookId}`,
    );
  }

  private async importTitles(bdb: Database.Database, bookId: number) {
    let rows: V4Title[] = [];
    try {
      rows = bdb.prepare('SELECT id, page, parent, tit FROM title').all() as V4Title[];
    } catch { return; }

    if (rows.length === 0) return;

    for (let i = 0; i < rows.length; i += BATCH) {
      await this.db
        .insert(schema.titles)
        .values(rows.slice(i, i + BATCH).map((r) => ({
          bookId,
          shamelaId: r.id,
          content: r.tit ?? '',
          pageShamelaId: r.page ?? 0,
          parentShamelaId: r.parent ?? null,
        })))
        .onConflictDoNothing();
    }
  }

  async importBookContent(dbPath: string, bookId: number) {
    const bdb = new Database(dbPath, { readonly: true });
    try {
      await this.importTitles(bdb, bookId);
      await this.importPagesMeta(bdb, bookId);
    } finally {
      bdb.close();
    }
  }
}
