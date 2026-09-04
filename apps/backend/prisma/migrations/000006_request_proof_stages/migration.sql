CREATE TABLE "request_proof_stages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "proof_started_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "request_proof_stages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "request_proof_stages_user_id_request_id_key" ON "request_proof_stages"("user_id", "request_id");
CREATE INDEX "request_proof_stages_user_id_proof_started_at_idx" ON "request_proof_stages"("user_id", "proof_started_at");

ALTER TABLE "request_proof_stages" ADD CONSTRAINT "request_proof_stages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
