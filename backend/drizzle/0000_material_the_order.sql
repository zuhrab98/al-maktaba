CREATE TABLE "authors" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"biography" text,
	"death_number" text,
	"death_text" text
);
--> statement-breakpoint
CREATE TABLE "book_authors" (
	"book_id" integer NOT NULL,
	"author_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"book_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"author_ids" integer[] DEFAULT '{}' NOT NULL,
	"category_id" integer,
	"bibliography" text,
	"date" text,
	"hint" text,
	"metadata" jsonb,
	"pdf_links" jsonb,
	"printed" boolean DEFAULT false,
	"type" text,
	"major_release" integer DEFAULT 0,
	"minor_release" integer DEFAULT 0,
	"pages_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0,
	"book_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"book_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"book_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"shamela_id" integer NOT NULL,
	"content" text NOT NULL,
	"part" text,
	"page" integer,
	"number" text
);
--> statement-breakpoint
CREATE TABLE "reading_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"book_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"progress" real DEFAULT 0,
	"last_read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"shamela_id" integer NOT NULL,
	"content" text NOT NULL,
	"page_shamela_id" integer NOT NULL,
	"parent_shamela_id" integer
);
--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titles" ADD CONSTRAINT "titles_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "authors_name_idx" ON "authors" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "book_authors_unique_idx" ON "book_authors" USING btree ("book_id","author_id");--> statement-breakpoint
CREATE INDEX "book_authors_author_idx" ON "book_authors" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "bookmarks_session_idx" ON "bookmarks" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "bookmarks_book_idx" ON "bookmarks" USING btree ("session_id","book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_unique_idx" ON "bookmarks" USING btree ("session_id","page_id");--> statement-breakpoint
CREATE INDEX "books_category_idx" ON "books" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "books_name_idx" ON "books" USING btree ("name");--> statement-breakpoint
CREATE INDEX "books_author_ids_idx" ON "books" USING btree ("author_ids");--> statement-breakpoint
CREATE INDEX "categories_order_idx" ON "categories" USING btree ("order");--> statement-breakpoint
CREATE INDEX "favorites_session_idx" ON "favorites" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_unique_idx" ON "favorites" USING btree ("session_id","book_id");--> statement-breakpoint
CREATE INDEX "notes_session_idx" ON "notes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "notes_page_idx" ON "notes" USING btree ("session_id","page_id");--> statement-breakpoint
CREATE INDEX "pages_book_idx" ON "pages" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "pages_book_page_idx" ON "pages" USING btree ("book_id","page");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_book_shamela_idx" ON "pages" USING btree ("book_id","shamela_id");--> statement-breakpoint
CREATE INDEX "history_session_idx" ON "reading_history" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "history_session_book_idx" ON "reading_history" USING btree ("session_id","book_id");--> statement-breakpoint
CREATE INDEX "titles_book_idx" ON "titles" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "titles_parent_idx" ON "titles" USING btree ("book_id","parent_shamela_id");