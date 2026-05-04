import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class FavoritesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll(sessionId: string) {
    return this.db.query.favorites.findMany({
      where: eq(schema.favorites.sessionId, sessionId),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });
  }

  async toggle(sessionId: string, bookId: number) {
    const existing = await this.db.query.favorites.findFirst({
      where: and(
        eq(schema.favorites.sessionId, sessionId),
        eq(schema.favorites.bookId, bookId),
      ),
    });

    if (existing) {
      await this.db.delete(schema.favorites).where(eq(schema.favorites.id, existing.id));
      return { favorited: false };
    }

    await this.db.insert(schema.favorites).values({ sessionId, bookId });
    return { favorited: true };
  }

  async isFavorited(sessionId: string, bookId: number) {
    const existing = await this.db.query.favorites.findFirst({
      where: and(
        eq(schema.favorites.sessionId, sessionId),
        eq(schema.favorites.bookId, bookId),
      ),
    });
    return { favorited: !!existing };
  }
}
