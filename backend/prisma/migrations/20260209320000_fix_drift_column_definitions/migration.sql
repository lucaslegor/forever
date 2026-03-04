-- Alinea definiciones de columnas con el schema (elimina drift).
-- cuotas.anio: la base puede tener NULL/sin default; debe quedar NOT NULL DEFAULT 2024.
-- grupos_familiares.titular_dni: unificar tipo si difiere (p. ej. TEXT -> VARCHAR(20)).

UPDATE "cuotas" SET "anio" = 2024 WHERE "anio" IS NULL;
ALTER TABLE "cuotas" ALTER COLUMN "anio" SET NOT NULL;
ALTER TABLE "cuotas" ALTER COLUMN "anio" SET DEFAULT 2024;

ALTER TABLE "grupos_familiares" ALTER COLUMN "titular_dni" TYPE VARCHAR(20) USING "titular_dni"::VARCHAR(20);
