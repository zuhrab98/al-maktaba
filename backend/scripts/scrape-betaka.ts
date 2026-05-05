/**
 * Парсинг betaka (карточек книг) с shamela.ws
 * Запуск: node_modules/.bin/ts-node -P tsconfig.json scripts/scrape-betaka.ts
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { chromium } from 'playwright';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL!;
const DELAY  = 1500; // пауза между запросами чтобы не банили
const BATCH  = 50;   // сохраняем каждые 50 книг

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const sql = postgres(DB_URL, { max: 1 });

  // Берём книги у которых ещё нет betaka
  const books = await sql<{ id: number }[]>`
    SELECT id FROM books WHERE betaka IS NULL ORDER BY id
  `;

  console.log(`Книг для парсинга: ${books.length}`);

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  // Блокируем картинки и стили — быстрее загружается
  await page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}', r => r.abort());

  let done    = 0;
  let failed  = 0;
  let updates: { id: number; betaka: string }[] = [];

  const flush = async () => {
    if (updates.length === 0) return;
    for (const u of updates) {
      await sql`UPDATE books SET betaka = ${u.betaka} WHERE id = ${u.id}`;
    }
    console.log(`  Сохранено ${updates.length} книг`);
    updates = [];
  };

  for (const book of books) {
    try {
      await page.goto(`https://shamela.ws/book/${book.id}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      const lines = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h3'))
          .find(el => el.textContent?.includes('بطاقة'));
        if (!h) return [] as string[];
        const parent = h.parentElement!;
        const result: string[] = [];
        for (const node of parent.childNodes) {
          if (node.nodeType === 3 && node.textContent?.trim()) {
            result.push(node.textContent.trim());
          }
        }
        return result;
      });

      if (lines.length > 0) {
        updates.push({ id: book.id, betaka: lines.join('\n') });
        done++;
      } else {
        failed++;
      }

      if (updates.length >= BATCH) await flush();

      if ((done + failed) % 100 === 0) {
        console.log(`Прогресс: ${done + failed} / ${books.length} | ✅ ${done} | ❌ ${failed}`);
      }

      await sleep(DELAY);

    } catch (e) {
      failed++;
    }
  }

  await flush();
  await browser.close();
  await sql.end();

  console.log(`\n✅ Готово: ${done} книг | ❌ Не удалось: ${failed}`);
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
