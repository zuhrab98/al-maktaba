import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class NotesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll(sessionId: string) {
    return this.db.query.notes.findMany({
      where: eq(schema.notes.sessionId, sessionId),
      orderBy: (n, { desc }) => [desc(n.updatedAt)],
    });
  }

  async upsert(sessionId: string, bookId: number, pageId: number, content: string) {
    const existing = await this.db.query.notes.findFirst({
      where: and(eq(schema.notes.sessionId, sessionId), eq(schema.notes.pageId, pageId)),
    });

    if (existing) {
      return this.db
        .update(schema.notes)
        .set({ content, updatedAt: new Date() })
        .where(eq(schema.notes.id, existing.id))
        .returning();
    }

    return this.db
      .insert(schema.notes)
      .values({ sessionId, bookId, pageId, content })
      .returning();
  }

  async delete(sessionId: string, noteId: number) {
    await this.db
      .delete(schema.notes)
      .where(and(eq(schema.notes.id, noteId), eq(schema.notes.sessionId, sessionId)));
    return { deleted: true };
  }
}
