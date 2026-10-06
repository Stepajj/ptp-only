CREATE TYPE "ContentAuditAction" AS ENUM ('CREATED', 'UPDATED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED', 'RESTORED', 'SLUG_CHANGED', 'MEDIA_UPLOADED');
CREATE TABLE "content_audit_log" (
  "id" UUID NOT NULL,
  "page_id" UUID,
  "action" "ContentAuditAction" NOT NULL,
  "actor" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_audit_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_audit_log_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "content_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "content_audit_log_page_id_created_at_idx" ON "content_audit_log"("page_id", "created_at");
