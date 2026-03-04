-- Quitar UNIQUE de id_deportista para permitir varios adultos por deportista.
-- Ejecutá este script en la base de datos (Supabase SQL Editor, psql, etc.) si
-- al agregar más de un adulto responsable ves: "Unique constraint failed on the fields: (id_deportista)".

-- Opción 1: nombre estándar de constraint (Prisma / PostgreSQL)
ALTER TABLE "adultos_responsables"
  DROP CONSTRAINT IF EXISTS "adultos_responsables_id_deportista_key";

-- Si falla, buscá el nombre real de la constraint con:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'adultos_responsables'::regclass AND contype = 'u';
-- y reemplazá el nombre en un ALTER TABLE ... DROP CONSTRAINT "nombre_que_te_dio";
