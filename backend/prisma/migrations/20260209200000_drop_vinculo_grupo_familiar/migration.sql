-- AlterTable
ALTER TABLE "grupo_familiar_integrantes" DROP COLUMN IF EXISTS "vinculo";

-- DropEnum
DROP TYPE IF EXISTS "Vinculo";
