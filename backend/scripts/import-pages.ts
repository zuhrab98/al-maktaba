/**
 * Импорт текста страниц из TSV (результат ExtractPages.java) в PostgreSQL.
 *
 * TSV формат (разделитель \t):
 *   id         body        foot
 *   71-12090   <arabic>    <footnotes>
 *
 * Запуск:
 *   npx ts-node -P tsconfig.json scripts/import-pages.ts /tmp/shamela_probe.tsv
 */

import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL!;
const BATCH_SIZE = 2000;

type Row = [number, number, string, string | null];

async function main() {
  const tsvPath = process.argv[2];
  if (!tsvPath || !fs.existsSync(tsvPath)) {
    console.error('Usage: npx ts-node -P tsconfig.json scripts/import-pages.ts <tsv>');
    process.exit(1);
  }

  const sql = postgres(DB_URL, { max: 3 });

  console.log('Очищаем таблицу pages...');
  await sql`TRUNCATE TABLE pages RESTART IDENTITY CASCADE`;
  console.log('Готово. Начинаем импорт...\n');

  const rl = readline.createInterface({
    input: fs.createReadStream(tsvPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  let imported = 0;
  let skipped = 0;
  let batch: Row[] = [];

  const flushBatch = async (rows: Row[]) => {
    if (rows.length === 0) return;

    const bookIds     = rows.map(r => r[0]);
    const shamelaIds  = rows.map(r => r[1]);
    const contents    = rows.map(r => r[2]);
    const feet        = rows.map(r => r[3]);

    await sql`
      INSERT INTO pages (book_id, shamela_id, content, foot)
      SELECT * FROM unnest(
        ${sql.array(bookIds)}::int[],
        ${sql.array(shamelaIds)}::int[],
        ${sql.array(contents)}::text[],
        ${sql.array(feet)}::text[]
      ) AS t(book_id, shamela_id, content, foot)
      ON CONFLICT DO NOTHING
    `;
  };

  const startTime = Date.now();

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // заголовок

    const tabIdx1 = line.indexOf('\t');
    if (tabIdx1 === -1) { skipped++; continue; }

    const id = line.slice(0, tabIdx1);
    const dashIdx = id.indexOf('-');
    if (dashIdx === -1) { skipped++; continue; }

    const bookId    = parseInt(id.slice(0, dashIdx), 10);
    const shamelaId = parseInt(id.slice(dashIdx + 1), 10);
    if (isNaN(bookId) || isNaN(shamelaId)) { skipped++; continue; }

    const rest = line.slice(tabIdx1 + 1);
    const tabIdx2 = rest.indexOf('\t');
    const content = tabIdx2 === -1 ? rest : rest.slice(0, tabIdx2);
    const foot    = tabIdx2 === -1 ? null : rest.slice(tabIdx2 + 1) || null;

    batch.push([bookId, shamelaId, content, foot]);

    if (batch.length >= BATCH_SIZE) {
      await flushBatch(batch);
      imported += batch.length;
      batch = [];

      if (imported % 100_000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate    = Math.round(imported / +elapsed);
        const eta     = Math.round((7_358_148 - imported) / rate);
        console.log(`${imported.toLocaleString('ru')} / 7 358 148 | ${rate.toLocaleString('ru')} стр/сек | ~${eta}с до конца`);
      }
    }
  }

  // последний батч
  await flushBatch(batch);
  imported += batch.length;

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Импорт завершён за ${elapsed}с`);
  console.log(`   Импортировано: ${imported.toLocaleString('ru')} страниц`);
  console.log(`   Пропущено:     ${skipped} строк`);

  console.log('\nОбновляем pages_count в таблице books...');
  await sql`
    UPDATE books
    SET pages_count = sub.cnt
    FROM (
      SELECT book_id, COUNT(*)::int AS cnt
      FROM pages
      GROUP BY book_id
    ) sub
    WHERE books.id = sub.book_id
  `;
  console.log('✅ pages_count обновлён.');

  await sql.end();
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message ?? err);
  process.exit(1);
});
