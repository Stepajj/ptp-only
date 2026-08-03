ALTER TABLE "users"
  ADD COLUMN "telegram_id" TEXT,
  ADD COLUMN "telegram_username" TEXT,
  ADD COLUMN "telegram_first_name" TEXT,
  ADD COLUMN "telegram_photo_url" TEXT,
  ADD COLUMN "telegram_linked_at" TIMESTAMPTZ(3);

CREATE UNIQUE INDEX "users_telegram_id_key"
  ON "users"("telegram_id");
