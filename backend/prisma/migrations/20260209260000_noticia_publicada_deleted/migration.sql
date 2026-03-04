-- Publicar/despublicar y soft delete para noticias
ALTER TABLE "noticias" ADD COLUMN IF NOT EXISTS "publicada" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "noticias" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
