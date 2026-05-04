import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class HistoryService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll(sessionId: string) {
    return this.db.query.readingHistory.findMany({
      where: eq(schema.readingHistory.sessionId, sessionId),
      orderBy: (h, { desc }) => [desc(h.lastReadAt)],
      limit: 50,
    });
  }

  async upsert(sessionId: string, bookId: number, pageId: number, progress: number) {
    return this.db
      .insert(schema.readingHistory)
      .values({ sessionId, bookId, pageId, progress, lastReadAt: new Date() })
      .onConflictDoUpdate({
        target: [schema.readingHistory.sessionId, schema.readingHistory.bookId],
        set: { pageId, progress, lastReadAt: new Date() },
      })
      .returning();
  }

  getBookProgress(sessionId: string, bookId: number) {
    return this.db.query.readingHistory.findFirst({
      where: and(
        eq(schema.readingHistory.sessionId, sessionId),
        eq(schema.readingHistory.bookId, bookId),
      ),
    });
  }
}
