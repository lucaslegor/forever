-- Gestión de becas: becado (boolean) y cuota_beca (monto opcional para casos excepcionales)
ALTER TABLE "deportistas" ADD COLUMN IF NOT EXISTS "becado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "deportistas" ADD COLUMN IF NOT EXISTS "cuota_beca" DECIMAL(10,2);
