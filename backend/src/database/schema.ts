import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  real,
  jsonb,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// Shamela core tables (импортируются из ISO)
// ─────────────────────────────────────────────

export const categories = pgTable(
  'categories',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    order: integer('order').default(0),
    bookCount: integer('book_count').default(0),
  },
  (t) => [index('categories_order_idx').on(t.order)],
);

export const authors = pgTable(
  'authors',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    biography: text('biography'),
    deathNumber: text('death_number'),
    deathText: text('death_text'),
  },
  (t) => [index('authors_name_idx').on(t.name)],
);

export const books = pgTable(
  'books',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    // author может быть "513" или "2747, 3147" — храним массив
    authorIds: integer('author_ids').array().notNull().default([]),
    categoryId: integer('category_id').references(() => categories.id),
    bibliography: text('bibliography'),
    date: text('date'),
    hint: text('hint'),
    metadata: jsonb('metadata'),
    pdfLinks: jsonb('pdf_links'),
    printed: boolean('printed').default(false),
    type: text('type'),
    majorRelease: integer('major_release').default(0),
    minorRelease: integer('minor_release').default(0),
    pagesCount: integer('pages_count').default(0),
    betaka: text('betaka'),
  },
  (t) => [
    index('books_category_idx').on(t.categoryId),
    index('books_name_idx').on(t.name),
    // GIN индекс для поиска по массиву авторов
    index('books_author_ids_idx').on(t.authorIds),
  ],
);

// Связь многие-ко-многим: книга ↔ автор
export const bookAuthors = pgTable(
  'book_authors',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    authorId: integer('author_id')
      .notNull()
      .references(() => authors.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('book_authors_unique_idx').on(t.bookId, t.authorId),
    index('book_authors_author_idx').on(t.authorId),
  ],
);

export const pages = pgTable(
  'pages',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    // Оригинальный id из Shamela SQLite (внутри книги)
    shamelaId: integer('shamela_id').notNull(),
    content: text('content').notNull(),
    foot: text('foot'),
    part: text('part'),
    page: integer('page'),
    number: text('number'),
  },
  (t) => [
    index('pages_book_idx').on(t.bookId),
    index('pages_book_page_idx').on(t.bookId, t.page),
    uniqueIndex('pages_book_shamela_idx').on(t.bookId, t.shamelaId),
  ],
);

export const titles = pgTable(
  'titles',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    shamelaId: integer('shamela_id').notNull(),
    content: text('content').notNull(),
    // page ссылается на shamelaId страницы внутри книги
    pageShamelaId: integer('page_shamela_id').notNull(),
    parentShamelaId: integer('parent_shamela_id'),
  },
  (t) => [
    index('titles_book_idx').on(t.bookId),
    index('titles_parent_idx').on(t.bookId, t.parentShamelaId),
  ],
);

// ─────────────────────────────────────────────
// Персональные функции (без авторизации)
// Идентифицируем пользователя по session_id (cookie)
// ─────────────────────────────────────────────

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('bookmarks_session_idx').on(t.sessionId),
    index('bookmarks_book_idx').on(t.sessionId, t.bookId),
    uniqueIndex('bookmarks_unique_idx').on(t.sessionId, t.pageId),
  ],
);

export const notes = pgTable(
  'notes',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('notes_session_idx').on(t.sessionId),
    index('notes_page_idx').on(t.sessionId, t.pageId),
  ],
);

export const readingHistory = pgTable(
  'reading_history',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    // 0.0 - 1.0 прогресс чтения книги
    progress: real('progress').default(0),
    lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
  },
  (t) => [
    index('history_session_idx').on(t.sessionId),
    // один записи на сессию+книга (upsert по этому ключу)
    uniqueIndex('history_session_book_idx').on(t.sessionId, t.bookId),
  ],
);

export const favorites = pgTable(
  'favorites',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('favorites_session_idx').on(t.sessionId),
    uniqueIndex('favorites_unique_idx').on(t.sessionId, t.bookId),
  ],
);

// ─────────────────────────────────────────────
// Типы для TypeScript
// ─────────────────────────────────────────────

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type Title = typeof titles.$inferSelect;
export type NewTitle = typeof titles.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type NewReadingHistory = typeof readingHistory.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
