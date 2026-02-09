-- =============================================================================
-- Ejecutar en Supabase > SQL Editor (Run)
-- Quita la columna vinculo de grupo_familiar_integrantes.
-- =============================================================================

ALTER TABLE "grupo_familiar_integrantes" DROP COLUMN IF EXISTS "vinculo";
DROP TYPE IF EXISTS "Vinculo";
