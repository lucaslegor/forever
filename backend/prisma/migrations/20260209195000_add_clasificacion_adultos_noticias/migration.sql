-- Create tables that were previously only in manual SQL (20260209_add_clasificacion_noticias.sql)
-- so that Prisma shadow DB has them before 20260209210000_adultos_responsables_uno_a_muchos.

CREATE TABLE IF NOT EXISTS "generos" (
    "id_genero" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id_genero"),
    CONSTRAINT "generos_nombre_key" UNIQUE ("nombre")
);

CREATE TABLE IF NOT EXISTS "categorias" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria"),
    CONSTRAINT "categorias_nombre_key" UNIQUE ("nombre")
);

CREATE TABLE IF NOT EXISTS "subcategorias" (
    "id_subcategoria" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_disciplina" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "id_genero" INTEGER,

    CONSTRAINT "subcategorias_pkey" PRIMARY KEY ("id_subcategoria"),
    CONSTRAINT "subcategorias_id_disciplina_id_categoria_id_genero_nombre_key" UNIQUE ("id_disciplina", "id_categoria", "id_genero", "nombre")
);

ALTER TABLE "subcategorias" DROP CONSTRAINT IF EXISTS "subcategorias_id_disciplina_fkey";
ALTER TABLE "subcategorias" ADD CONSTRAINT "subcategorias_id_disciplina_fkey"
    FOREIGN KEY ("id_disciplina") REFERENCES "disciplinas"("id_disciplina") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subcategorias" DROP CONSTRAINT IF EXISTS "subcategorias_id_categoria_fkey";
ALTER TABLE "subcategorias" ADD CONSTRAINT "subcategorias_id_categoria_fkey"
    FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subcategorias" DROP CONSTRAINT IF EXISTS "subcategorias_id_genero_fkey";
ALTER TABLE "subcategorias" ADD CONSTRAINT "subcategorias_id_genero_fkey"
    FOREIGN KEY ("id_genero") REFERENCES "generos"("id_genero") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "adultos_responsables" (
    "id_adulto" SERIAL NOT NULL,
    "id_deportista" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50) NOT NULL,

    CONSTRAINT "adultos_responsables_pkey" PRIMARY KEY ("id_adulto"),
    CONSTRAINT "adultos_responsables_id_deportista_key" UNIQUE ("id_deportista")
);

ALTER TABLE "adultos_responsables" DROP CONSTRAINT IF EXISTS "adultos_responsables_id_deportista_fkey";
ALTER TABLE "adultos_responsables" ADD CONSTRAINT "adultos_responsables_id_deportista_fkey"
    FOREIGN KEY ("id_deportista") REFERENCES "deportistas"("id_deportista") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "noticias" (
    "id_noticia" SERIAL NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "fecha" DATE NOT NULL,
    "resumen" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "id_autor" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id_noticia")
);

ALTER TABLE "noticias" DROP CONSTRAINT IF EXISTS "noticias_id_autor_fkey";
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_id_autor_fkey"
    FOREIGN KEY ("id_autor") REFERENCES "administrativos"("id_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "noticia_imagenes" (
    "id_imagen" SERIAL NOT NULL,
    "id_noticia" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "noticia_imagenes_pkey" PRIMARY KEY ("id_imagen")
);

ALTER TABLE "noticia_imagenes" DROP CONSTRAINT IF EXISTS "noticia_imagenes_id_noticia_fkey";
ALTER TABLE "noticia_imagenes" ADD CONSTRAINT "noticia_imagenes_id_noticia_fkey"
    FOREIGN KEY ("id_noticia") REFERENCES "noticias"("id_noticia") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deportistas" ADD COLUMN IF NOT EXISTS "id_genero" INTEGER;
ALTER TABLE "deportistas" ADD COLUMN IF NOT EXISTS "id_categoria" INTEGER;
ALTER TABLE "deportistas" ADD COLUMN IF NOT EXISTS "id_subcategoria" INTEGER;

ALTER TABLE "deportistas" DROP CONSTRAINT IF EXISTS "deportistas_id_genero_fkey";
ALTER TABLE "deportistas" ADD CONSTRAINT "deportistas_id_genero_fkey"
    FOREIGN KEY ("id_genero") REFERENCES "generos"("id_genero") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deportistas" DROP CONSTRAINT IF EXISTS "deportistas_id_categoria_fkey";
ALTER TABLE "deportistas" ADD CONSTRAINT "deportistas_id_categoria_fkey"
    FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deportistas" DROP CONSTRAINT IF EXISTS "deportistas_id_subcategoria_fkey";
ALTER TABLE "deportistas" ADD CONSTRAINT "deportistas_id_subcategoria_fkey"
    FOREIGN KEY ("id_subcategoria") REFERENCES "subcategorias"("id_subcategoria") ON DELETE SET NULL ON UPDATE CASCADE;
