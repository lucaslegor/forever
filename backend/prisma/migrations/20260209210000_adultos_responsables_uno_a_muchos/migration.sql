-- Permite múltiples adultos responsables por deportista (quitar UNIQUE de id_deportista)
ALTER TABLE "adultos_responsables" DROP CONSTRAINT IF EXISTS "adultos_responsables_id_deportista_key";
