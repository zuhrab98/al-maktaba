/**
 * Импорт метаданных страниц (part, page, number) из SQLite book файлов.
 * Обновляет колонки part/page/number в таблице pages и pages_count в books.
 *
 * Запуск:
 *   node_modules/.bin/ts-node -P tsconfig.json scripts/import-page-meta.ts <databases-dir>
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL!;

interface SqlitePage {
  id: number;
  page: number | null;
  part: string | null;
  number: string | null;
}

async function main() {
  const dbRoot = process.argv[2];
  if (!dbRoot || !fs.existsSync(dbRoot)) {
    console.error('Usage: node_modules/.bin/ts-node -P tsconfig.json scripts/import-page-meta.ts <databases-dir>');
    process.exit(1);
  }

  const sql = postgres(DB_URL, { max: 1 });
  const bookDir = path.join(dbRoot, 'book');

  let processed = 0;
  let updatedBooks = 0;
  const start = Date.now();

  const subdirs = fs.readdirSync(bookDir).sort();

  for (const sub of subdirs) {
    const subPath = path.join(bookDir, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;

    const files = fs.readdirSync(subPath).filter(f => f.endsWith('.db'));

    for (const file of files) {
      const bookId = parseInt(path.basename(file, '.db'), 10);
      if (isNaN(bookId)) continue;

      const dbPath = path.join(subPath, file);
      let bdb: Database.Database;
      try {
        bdb = new Database(dbPath, { readonly: true });
      } catch {
        continue;
      }

      let rows: SqlitePage[] = [];
      try {
        rows = bdb.prepare('SELECT id, page, part, number FROM page ORDER BY id').all() as SqlitePage[];
      } catch {
        bdb.close();
        continue;
      }
      bdb.close();

      if (rows.length === 0) continue;

      // Находим MAX(page) для этой книги
      const maxPage = rows.reduce((max, r) => {
        const p = r.page ?? 0;
        return p > max ? p : max;
      }, 0);

      // Обновляем через временную таблицу values
      // Строим VALUES список для UPDATE
      const esc = (v: unknown) => String(v).replace(/'/g, "''");
      const valueRows = rows
        .filter(r => r.page != null || r.part != null || r.number != null)
        .map(r => `(${r.id}, ${r.page ?? 'NULL'}, ${r.part != null ? `'${esc(r.part)}'` : 'NULL'}, ${r.number != null ? `'${esc(r.number)}'` : 'NULL'})`);

      if (valueRows.length > 0) {
        // Разбиваем на батчи по 500
        const BATCH = 500;
        for (let i = 0; i < valueRows.length; i += BATCH) {
          const chunk = valueRows.slice(i, i + BATCH).join(',');
          await sql.unsafe(`
            UPDATE pages SET
              page   = t.page::int,
              part   = t.part,
              number = t.number
            FROM (VALUES ${chunk}) AS t(shamela_id, page, part, number)
            WHERE pages.book_id    = ${bookId}
              AND pages.shamela_id = t.shamela_id::int
          `);
        }
      }

      // Обновляем pages_count = MAX физической страницы (или кол-во chunks если нет page)
      const pagesCount = maxPage > 0 ? maxPage : rows.length;
      await sql`UPDATE books SET pages_count = ${pagesCount} WHERE id = ${bookId}`;

      updatedBooks++;
      processed++;
      if (processed % 500 === 0) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`Книг: ${processed} | ${elapsed}с`);
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Готово за ${elapsed}с — книг обновлено: ${updatedBooks}`);

  await sql.end();
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message ?? err);
  process.exit(1);
});
