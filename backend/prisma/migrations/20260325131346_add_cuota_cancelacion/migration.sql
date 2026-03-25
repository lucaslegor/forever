-- AlterEnum
ALTER TYPE "EstadoCuota" ADD VALUE 'Cancelada';

-- AlterTable
ALTER TABLE "cuotas" ADD COLUMN     "cancelacion_motivo" TEXT,
ADD COLUMN     "cancelada_at" TIMESTAMP(3),
ADD COLUMN     "cancelada_por_cuenta_id" INTEGER;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_cancelada_por_cuenta_id_fkey" FOREIGN KEY ("cancelada_por_cuenta_id") REFERENCES "cuentas_usuario"("id_cuenta") ON DELETE SET NULL ON UPDATE CASCADE;
