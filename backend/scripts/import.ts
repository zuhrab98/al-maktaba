/**
 * Запуск: npx ts-node scripts/import.ts /path/to/mounted/iso
 * Пример: npx ts-node scripts/import.ts /Volumes/shamela.full.1446.1
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ImportService } from '../src/import/import.service';
import * as schema from '../src/database/schema';

async function main() {
  const mountPath = process.argv[2];
  if (!mountPath) {
    console.error('Укажи путь к смонтированному ISO: npx ts-node scripts/import.ts /Volumes/shamela');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  const service = new ImportService(db as never);

  console.time('import');
  await service.importFromISO(mountPath);
  console.timeEnd('import');

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
