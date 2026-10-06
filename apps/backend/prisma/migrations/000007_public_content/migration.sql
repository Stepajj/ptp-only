CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ContentType" AS ENUM ('ARTICLE', 'FAQ', 'HOW_IT_WORKS', 'METHODS', 'SECURITY', 'ABOUT');

CREATE TABLE "content_pages" (
  "id" UUID NOT NULL,
  "type" "ContentType" NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "h1" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "author_type" TEXT NOT NULL DEFAULT 'Organization',
  "checked_at" TIMESTAMPTZ(3),
  "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "related_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "cta" TEXT,
  "published_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "content_pages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "content_pages_slug_key" ON "content_pages"("slug");
CREATE INDEX "content_pages_status_published_at_idx" ON "content_pages"("status", "published_at");

CREATE TABLE "content_revisions" (
  "id" UUID NOT NULL,
  "page_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_revisions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "content_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "content_revisions_page_id_version_key" ON "content_revisions"("page_id", "version");

CREATE TABLE "content_slug_redirects" (
  "id" UUID NOT NULL,
  "old_slug" TEXT NOT NULL,
  "new_slug" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_slug_redirects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "content_slug_redirects_old_slug_key" ON "content_slug_redirects"("old_slug");
