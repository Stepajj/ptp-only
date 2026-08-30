CREATE TABLE "requisite_monitors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "requisite_id" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'monitoring',
    "no_requests_since" TIMESTAMPTZ(3) NOT NULL,
    "prompted_at" TIMESTAMPTZ(3),
    "auto_disabled_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "requisite_monitors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "requisite_monitors_user_id_requisite_id_key" ON "requisite_monitors"("user_id", "requisite_id");
CREATE INDEX "requisite_monitors_state_prompted_at_idx" ON "requisite_monitors"("state", "prompted_at");
ALTER TABLE "requisite_monitors" ADD CONSTRAINT "requisite_monitors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
