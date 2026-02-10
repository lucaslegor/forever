-- CreateTable
CREATE TABLE "reservas_cancha" (
    "id_reserva" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" INTEGER NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "monto_sena" DECIMAL(10,2) NOT NULL DEFAULT 5000,
    "sena_pagada" BOOLEAN NOT NULL DEFAULT false,
    "resto_pagado" BOOLEAN NOT NULL DEFAULT false,
    "monto_total" DECIMAL(10,2),
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_cancha_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservas_cancha_fecha_hora_key" ON "reservas_cancha"("fecha", "hora");

-- CreateIndex
CREATE INDEX "reservas_cancha_fecha_idx" ON "reservas_cancha"("fecha");
