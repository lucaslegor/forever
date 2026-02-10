-- AlterTable
ALTER TABLE "reservas_cancha" ADD COLUMN IF NOT EXISTS "sena_metodo_pago" TEXT;
ALTER TABLE "reservas_cancha" ADD COLUMN IF NOT EXISTS "sena_expira_at" TIMESTAMP(3);

-- Index for cancelling expired transferencia reservations
CREATE INDEX IF NOT EXISTS "reservas_cancha_sena_metodo_expira_idx" ON "reservas_cancha"("sena_metodo_pago", "sena_expira_at");
