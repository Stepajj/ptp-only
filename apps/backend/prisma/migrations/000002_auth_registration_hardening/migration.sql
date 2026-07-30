ALTER TABLE "users"
  ADD COLUMN "email_verified_at" TIMESTAMPTZ(3),
  ADD COLUMN "pending_only_p2p_external_user_id" TEXT;

CREATE UNIQUE INDEX "users_pending_only_p2p_external_user_id_key"
  ON "users"("pending_only_p2p_external_user_id");

DROP INDEX "user_credentials_user_id_idx";

CREATE UNIQUE INDEX "user_credentials_user_id_key" ON "user_credentials"("user_id");
