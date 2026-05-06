/**
 * Импорт иерархии оглавлений из SQLite book файлов.
 * Заполняет таблицу titles: shamela_id, page_shamela_id, parent_shamela_id.
 * Текст заголовка берётся из контента страницы (уже есть в таблице pages).
 *
 * Запуск:
 *   node_modules/.bin/ts-node -P tsconfig.json scripts/import-titles.ts <databases-dir>
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL!;

interface SqliteTitle {
  id: number;    // shamelaId заголовка (= shamelaId страницы)
  page: number;  // shamelaId страницы где находится заголовок
  parent: number; // id родительского заголовка (0 = корень)
}

async function main() {
  const dbRoot = process.argv[2];
  if (!dbRoot || !fs.existsSync(dbRoot)) {
    console.error('Usage: node_modules/.bin/ts-node -P tsconfig.json scripts/import-titles.ts <databases-dir>');
    process.exit(1);
  }

  const sql = postgres(DB_URL, { max: 1 });
  const bookDir = path.join(dbRoot, 'book');

  let processed = 0;
  let totalTitles = 0;
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

      let rows: SqliteTitle[] = [];
      try {
        rows = bdb.prepare('SELECT id, page, parent FROM title ORDER BY id').all() as SqliteTitle[];
      } catch {
        bdb.close();
        continue;
      }
      bdb.close();

      if (rows.length === 0) continue;

      // Удаляем старые данные для этой книги
      await sql`DELETE FROM titles WHERE book_id = ${bookId}`;

      // shamela_id = title.id (порядковый номер заголовка в иерархии)
      // page_shamela_id = title.page (shamelaId страницы где находится заголовок)
      // parent_shamela_id = title.parent (0 = корень → NULL)
      // content не храним — текст заголовка извлекается из pages.content через getToc
      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const chunk = rows.slice(i, i + BATCH);
        await sql`
          INSERT INTO titles (book_id, shamela_id, content, page_shamela_id, parent_shamela_id)
          SELECT
            ${bookId},
            t.shamela_id,
            '',
            t.page_shamela_id,
            t.parent_shamela_id
          FROM unnest(
            ${sql.array(chunk.map(r => r.id))}::int[],
            ${sql.array(chunk.map(r => r.page))}::int[],
            ${sql.array(chunk.map(r => r.parent === 0 ? null : r.parent))}::int[]
          ) AS t(shamela_id, page_shamela_id, parent_shamela_id)
        `;
        totalTitles += chunk.length;
      }

      processed++;
      if (processed % 500 === 0) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`Книг: ${processed} | заголовков: ${totalTitles} | ${elapsed}с`);
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Готово за ${elapsed}с — книг: ${processed}, заголовков: ${totalTitles}`);

  await sql.end();
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message ?? err);
  process.exit(1);
});
