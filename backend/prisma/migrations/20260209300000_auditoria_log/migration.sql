-- CreateTable
CREATE TABLE "auditoria_log" (
    "id_auditoria" SERIAL NOT NULL,
    "id_cuenta" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "id_entidad" INTEGER,
    "detalles" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE INDEX "auditoria_log_id_cuenta_idx" ON "auditoria_log"("id_cuenta");

-- CreateIndex
CREATE INDEX "auditoria_log_entidad_id_entidad_idx" ON "auditoria_log"("entidad", "id_entidad");

-- CreateIndex
CREATE INDEX "auditoria_log_created_at_idx" ON "auditoria_log"("created_at");

-- AddForeignKey
ALTER TABLE "auditoria_log" ADD CONSTRAINT "auditoria_log_id_cuenta_fkey" FOREIGN KEY ("id_cuenta") REFERENCES "cuentas_usuario"("id_cuenta") ON DELETE SET NULL ON UPDATE CASCADE;
