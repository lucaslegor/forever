-- Sincroniza el historial de migraciones con la base real (columnas añadidas por SQL manual).
-- Seguro: ADD COLUMN IF NOT EXISTS no falla si ya existen.

ALTER TABLE "cuotas" ADD COLUMN IF NOT EXISTS "anio" INTEGER NOT NULL DEFAULT 2024;

ALTER TABLE "grupos_familiares" ADD COLUMN IF NOT EXISTS "titular_dni" VARCHAR(20);
ALTER TABLE "grupos_familiares" ADD COLUMN IF NOT EXISTS "cuota_hermano" DECIMAL(10,2);
