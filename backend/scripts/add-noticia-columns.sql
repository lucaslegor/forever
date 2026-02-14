-- Ejecutar en pgAdmin (base "forever") si las rutas /api/noticias devuelven 500
-- por columnas faltantes en la tabla noticias.
ALTER TABLE "public"."noticias"
  ADD COLUMN IF NOT EXISTS "publicada" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."noticias"
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
