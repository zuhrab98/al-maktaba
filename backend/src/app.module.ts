import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { PagesModule } from './pages/pages.module';
import { SearchModule } from './search/search.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { NotesModule } from './notes/notes.module';
import { HistoryModule } from './history/history.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BooksModule,
    AuthorsModule,
    CategoriesModule,
    PagesModule,
    SearchModule,
    BookmarksModule,
    NotesModule,
    HistoryModule,
    FavoritesModule,
    ImportModule,
  ],
})
export class AppModule {}
