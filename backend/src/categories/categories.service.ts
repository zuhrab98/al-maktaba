import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  findAll() {
    return this.db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.order)],
    });
  }

  findOne(id: number) {
    return this.db.query.categories.findFirst({
      where: eq(schema.categories.id, id),
    });
  }
}
