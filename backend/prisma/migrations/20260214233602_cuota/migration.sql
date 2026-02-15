/*
  Warnings:

  - You are about to drop the column `categoria` on the `deportistas` table. All the data in the column will be lost.
  - You are about to drop the column `enfermedades` on the `deportistas` table. All the data in the column will be lost.
  - You are about to drop the column `obra_social` on the `deportistas` table. All the data in the column will be lost.
  - You are about to drop the column `telefonos` on the `deportistas` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `disciplinas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_deportista,nro_cuota,anio,id_disciplina]` on the table `cuotas` will be added. If there are existing duplicate values, this will fail.
  - Made the column `id_genero` on table `deportistas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_categoria` on table `deportistas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "deportistas" DROP CONSTRAINT "deportistas_id_categoria_fkey";

-- DropForeignKey
ALTER TABLE "deportistas" DROP CONSTRAINT "deportistas_id_genero_fkey";

-- DropForeignKey
ALTER TABLE "subcategorias" DROP CONSTRAINT "subcategorias_id_categoria_fkey";

-- DropForeignKey
ALTER TABLE "subcategorias" DROP CONSTRAINT "subcategorias_id_disciplina_fkey";

-- DropIndex
DROP INDEX "cuotas_id_deportista_nro_cuota_id_disciplina_key";

-- AlterTable
ALTER TABLE "adultos_responsables" ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "apellido" SET DATA TYPE TEXT,
ALTER COLUMN "dni" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "telefono" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "categorias" ALTER COLUMN "nombre" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "config" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cuotas" ALTER COLUMN "anio" DROP DEFAULT;

-- AlterTable
ALTER TABLE "deportistas" DROP COLUMN "categoria",
DROP COLUMN "enfermedades",
DROP COLUMN "obra_social",
DROP COLUMN "telefonos",
ALTER COLUMN "id_genero" SET NOT NULL,
ALTER COLUMN "id_categoria" SET NOT NULL;

-- AlterTable
ALTER TABLE "disciplinas" DROP COLUMN "descripcion";

-- AlterTable
ALTER TABLE "generos" ALTER COLUMN "nombre" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "grupos_familiares" ALTER COLUMN "titular_dni" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "noticias" ALTER COLUMN "titulo" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "subcategorias" ALTER COLUMN "nombre" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "adultos_responsables_id_deportista_idx" ON "adultos_responsables"("id_deportista");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_id_deportista_nro_cuota_anio_id_disciplina_key" ON "cuotas"("id_deportista", "nro_cuota", "anio", "id_disciplina");

-- AddForeignKey
ALTER TABLE "subcategorias" ADD CONSTRAINT "subcategorias_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "disciplinas"("id_disciplina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategorias" ADD CONSTRAINT "subcategorias_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deportistas" ADD CONSTRAINT "deportistas_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "generos"("id_genero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deportistas" ADD CONSTRAINT "deportistas_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "reservas_cancha_sena_metodo_expira_idx" RENAME TO "reservas_cancha_sena_metodo_pago_sena_expira_at_idx";
