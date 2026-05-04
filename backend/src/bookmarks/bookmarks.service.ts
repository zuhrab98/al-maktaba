import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class BookmarksService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll(sessionId: string) {
    return this.db.query.bookmarks.findMany({
      where: eq(schema.bookmarks.sessionId, sessionId),
      orderBy: (b, { desc }) => [desc(b.createdAt)],
      with: { },
    });
  }

  async toggle(sessionId: string, bookId: number, pageId: number) {
    const existing = await this.db.query.bookmarks.findFirst({
      where: and(
        eq(schema.bookmarks.sessionId, sessionId),
        eq(schema.bookmarks.pageId, pageId),
      ),
    });

    if (existing) {
      await this.db
        .delete(schema.bookmarks)
        .where(eq(schema.bookmarks.id, existing.id));
      return { bookmarked: false };
    }

    await this.db.insert(schema.bookmarks).values({ sessionId, bookId, pageId });
    return { bookmarked: true };
  }

  async isBookmarked(sessionId: string, pageId: number) {
    const existing = await this.db.query.bookmarks.findFirst({
      where: and(
        eq(schema.bookmarks.sessionId, sessionId),
        eq(schema.bookmarks.pageId, pageId),
      ),
    });
    return { bookmarked: !!existing };
  }
}
