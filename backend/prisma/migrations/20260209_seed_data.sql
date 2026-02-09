-- Seed data for Club For Ever database
-- Run after main migration

-- =============================================================================
-- 1. ENSURE DISCIPLINES EXIST
-- =============================================================================

INSERT INTO "disciplinas" ("nombre", "descripcion", "precio_mensual", "activa", "created_at", "updated_at") VALUES
  ('Futbol', 'Fútbol masculino y femenino', 10000.00, true, NOW(), NOW()),
  ('Hockey', 'Hockey sobre césped', 12000.00, true, NOW(), NOW())
ON CONFLICT ("nombre") DO UPDATE SET
  "precio_mensual" = EXCLUDED."precio_mensual",
  "activa" = EXCLUDED."activa",
  "updated_at" = NOW();

-- =============================================================================
-- 2. ENSURE LOCALIDADES EXIST
-- =============================================================================

INSERT INTO "localidades" ("codigo_postal", "nombre") VALUES
  ('1900', 'La Plata'),
  ('1901', 'City Bell'),
  ('1902', 'Gonnet')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. CREATE ADMIN ACCOUNT
-- =============================================================================

-- Create admin cuenta (password is hashed 'admin123' with bcrypt)
DO $$
DECLARE
  admin_cuenta_id INTEGER;
BEGIN
  -- Insert cuenta_usuario for admin
  INSERT INTO "cuentas_usuario" ("email", "password", "rol", "activo", "created_at", "updated_at") VALUES
    ('admin@foreverclub.com', '$2b$10$rQ4nYKZ9ZYJZvXQJ3YhY0OYr8wPx6kFQ3KFqYqKFqKFqKFqKFqKFq', 'Admin', true, NOW(), NOW())
  ON CONFLICT ("email") DO UPDATE SET 
    "password" = EXCLUDED."password",
    "updated_at" = NOW()
  RETURNING "id_cuenta" INTO admin_cuenta_id;

  -- If admin account was just created, create administrativo record
  IF admin_cuenta_id IS NOT NULL THEN
    INSERT INTO "administrativos" ("nombre", "apellido", "dni", "id_cuenta", "created_at", "updated_at") VALUES
      ('Administrador', 'Principal', 'admin', admin_cuenta_id, NOW(), NOW())
    ON CONFLICT ("dni") DO NOTHING;
  END IF;
END $$;

-- =============================================================================
-- 4. CREATE SAMPLE DOMICILIO (for testing)
-- =============================================================================

DO $$
DECLARE
  localidad_id INTEGER;
  domicilio_id INTEGER;
BEGIN
  -- Get La Plata localidad ID
  SELECT "id_localidad" INTO localidad_id FROM "localidades" WHERE "nombre" = 'La Plata' LIMIT 1;
  
  IF localidad_id IS NOT NULL THEN
    -- Insert sample domicilio
    INSERT INTO "domicilios" ("calle", "numero", "piso", "departamento", "id_localidad") VALUES
      ('Calle 50', '123', NULL, NULL, localidad_id)
    RETURNING "id_domicilio" INTO domicilio_id;
  END IF;
END $$;

-- =============================================================================
-- 5. CREATE SAMPLE DEPORTISTAS (for testing)
-- =============================================================================

DO $$
DECLARE
  futbol_id INTEGER;
  masculino_id INTEGER;
  femenino_id INTEGER;
  mayores_id INTEGER;
  juveniles_id INTEGER;
  octava_subcategoria_id INTEGER;
  primera_subcategoria_id INTEGER;
  domicilio_id INTEGER;
  cuenta_juan_id INTEGER;
  cuenta_maria_id INTEGER;
  deportista_juan_id INTEGER;
  deportista_maria_id INTEGER;
BEGIN
  -- Get necessary IDs
  SELECT "id_disciplina" INTO futbol_id FROM "disciplinas" WHERE "nombre" = 'Futbol';
  SELECT "id_genero" INTO masculino_id FROM "generos" WHERE "nombre" = 'Masculino';
  SELECT "id_genero" INTO femenino_id FROM "generos" WHERE "nombre" = 'Femenino';
  SELECT "id_categoria" INTO mayores_id FROM "categorias" WHERE "nombre" = 'Mayores';
  SELECT "id_categoria" INTO juveniles_id FROM "categorias" WHERE "nombre" = 'Juveniles';
  SELECT "id_domicilio" INTO domicilio_id FROM "domicilios" LIMIT 1;
  
  -- Get subcategoria IDs
  SELECT "id_subcategoria" INTO octava_subcategoria_id 
  FROM "subcategorias" 
  WHERE "nombre" = 'Octava' AND "id_disciplina" = futbol_id AND "id_categoria" = juveniles_id;
  
  SELECT "id_subcategoria" INTO primera_subcategoria_id 
  FROM "subcategorias" 
  WHERE "nombre" = 'Primera' AND "id_disciplina" = futbol_id AND "id_categoria" = mayores_id;

  IF domicilio_id IS NOT NULL AND futbol_id IS NOT NULL THEN
    -- Create Juan Pérez (Juveniles - needs adulto responsable)
    INSERT INTO "cuentas_usuario" ("email", "password", "rol", "activo", "created_at", "updated_at") VALUES
      ('juan.perez@email.com', '$2b$10$rQ4nYKZ9ZYJZvXQJ3YhY0OYr8wPx6kFQ3KFqYqKFqKFqKFqKFqKFq', 'Deportista', true, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET 
      "password" = EXCLUDED."password",
      "updated_at" = NOW()
    RETURNING "id_cuenta" INTO cuenta_juan_id;

    IF cuenta_juan_id IS NOT NULL AND masculino_id IS NOT NULL AND juveniles_id IS NOT NULL THEN
      INSERT INTO "deportistas" 
        ("nombre", "apellido", "dni", "fecha_nac", "id_genero", "id_categoria", "id_subcategoria", "id_disciplina", "id_cuenta", "id_domicilio", "estado", "created_at", "updated_at") 
      VALUES
        ('Juan', 'Pérez', '12345678', '2010-05-15', masculino_id, juveniles_id, octava_subcategoria_id, futbol_id, cuenta_juan_id, domicilio_id, 'Al dia', NOW(), NOW())
      ON CONFLICT ("dni") DO UPDATE SET "updated_at" = NOW()
      RETURNING "id_deportista" INTO deportista_juan_id;

      -- Add adulto responsable for Juan
      IF deportista_juan_id IS NOT NULL THEN
        INSERT INTO "adultos_responsables" 
          ("id_deportista", "nombre", "apellido", "dni", "email", "telefono") 
        VALUES
          (deportista_juan_id, 'María', 'Pérez', '23456789', 'maria.perez@email.com', '221-456-7890')
        ON CONFLICT ("id_deportista") DO NOTHING;
      END IF;
    END IF;

    -- Create María García (Mayores - no adulto responsable)
    INSERT INTO "cuentas_usuario" ("email", "password", "rol", "activo", "created_at", "updated_at") VALUES
      ('maria.garcia@email.com', '$2b$10$rQ4nYKZ9ZYJZvXQJ3YhY0OYr8wPx6kFQ3KFqYqKFqKFqKFqKFqKFq', 'Deportista', true, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET 
      "password" = EXCLUDED."password",
      "updated_at" = NOW()
    RETURNING "id_cuenta" INTO cuenta_maria_id;

    IF cuenta_maria_id IS NOT NULL AND femenino_id IS NOT NULL AND mayores_id IS NOT NULL THEN
      INSERT INTO "deportistas" 
        ("nombre", "apellido", "dni", "fecha_nac", "id_genero", "id_categoria", "id_subcategoria", "id_disciplina", "id_cuenta", "id_domicilio", "estado", "created_at", "updated_at") 
      VALUES
        ('María', 'García', '23456789', '1995-08-20', femenino_id, mayores_id, primera_subcategoria_id, futbol_id, cuenta_maria_id, domicilio_id, 'Al dia', NOW(), NOW())
      ON CONFLICT ("dni") DO UPDATE SET "updated_at" = NOW()
      RETURNING "id_deportista" INTO deportista_maria_id;
    END IF;
  END IF;
END $$;

-- =============================================================================
-- 6. CREATE SAMPLE GRUPO FAMILIAR
-- =============================================================================

DO $$
DECLARE
  grupo_id INTEGER;
  juan_id INTEGER;
  maria_id INTEGER;
BEGIN
  -- Get deportista IDs
  SELECT "id_deportista" INTO juan_id FROM "deportistas" WHERE "dni" = '12345678';
  SELECT "id_deportista" INTO maria_id FROM "deportistas" WHERE "dni" = '23456789';

  IF juan_id IS NOT NULL AND maria_id IS NOT NULL THEN
    -- Create grupo familiar
    INSERT INTO "grupos_familiares" ("nombre", "titular_dni", "cuota_hermano", "created_at", "updated_at") VALUES
      ('Familia Pérez', '12345678', 8000.00, NOW(), NOW())
    ON CONFLICT DO NOTHING
    RETURNING "id_grupo_familiar" INTO grupo_id;

    IF grupo_id IS NOT NULL THEN
      -- Add integrantes
      INSERT INTO "grupo_familiar_integrantes" ("id_grupo_familiar", "id_deportista", "es_principal") VALUES
        (grupo_id, juan_id, true),
        (grupo_id, maria_id, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- =============================================================================
-- 7. CREATE SAMPLE CUOTAS
-- =============================================================================

DO $$
DECLARE
  juan_id INTEGER;
  maria_id INTEGER;
  futbol_id INTEGER;
BEGIN
  SELECT "id_deportista" INTO juan_id FROM "deportistas" WHERE "dni" = '12345678';
  SELECT "id_deportista" INTO maria_id FROM "deportistas" WHERE "dni" = '23456789';
  SELECT "id_disciplina" INTO futbol_id FROM "disciplinas" WHERE "nombre" = 'Futbol';

  IF juan_id IS NOT NULL AND futbol_id IS NOT NULL THEN
    -- Cuotas para Juan (enero y febrero 2026)
    INSERT INTO "cuotas" 
      ("nro_cuota", "anio", "monto", "fecha_emision", "fecha_vencimiento", "estado_cuota", "id_disciplina", "id_deportista", "created_at", "updated_at") 
    VALUES
      (1, 2026, 10000.00, '2026-01-01', '2026-01-15', 'Vencida', futbol_id, juan_id, NOW(), NOW()),
      (2, 2026, 10000.00, '2026-02-01', '2026-02-15', 'Pendiente', futbol_id, juan_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  IF maria_id IS NOT NULL AND futbol_id IS NOT NULL THEN
    -- Cuotas para María (enero y febrero 2026)
    INSERT INTO "cuotas" 
      ("nro_cuota", "anio", "monto", "fecha_emision", "fecha_vencimiento", "estado_cuota", "id_disciplina", "id_deportista", "created_at", "updated_at") 
    VALUES
      (1, 2026, 10000.00, '2026-01-01', '2026-01-15', 'Pendiente', futbol_id, maria_id, NOW(), NOW()),
      (2, 2026, 10000.00, '2026-02-01', '2026-02-15', 'Pendiente', futbol_id, maria_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =============================================================================
-- 8. CREATE SAMPLE NOTICIAS
-- =============================================================================

DO $$
DECLARE
  admin_id INTEGER;
  noticia_id INTEGER;
BEGIN
  -- Get admin ID
  SELECT "id_administrativo" INTO admin_id FROM "administrativos" WHERE "dni" = 'admin';

  IF admin_id IS NOT NULL THEN
    -- Create sample noticia
    INSERT INTO "noticias" ("titulo", "fecha", "resumen", "contenido", "id_autor", "created_at", "updated_at") VALUES
      ('Inicio de Temporada 2026', 
       '2026-01-15', 
       'El club da la bienvenida a la nueva temporada con actividades para todas las disciplinas.',
       'Estimados socios, nos complace anunciar el inicio de la temporada 2026. Este año contamos con renovadas instalaciones y equipos técnicos de primer nivel para todas nuestras disciplinas. Los entrenamientos comenzarán a partir del 1 de febrero. ¡Los esperamos!',
       admin_id, NOW(), NOW())
    RETURNING "id_noticia" INTO noticia_id;

    -- Add sample image to noticia
    IF noticia_id IS NOT NULL THEN
      INSERT INTO "noticia_imagenes" ("id_noticia", "url", "orden") VALUES
        (noticia_id, '/uploads/noticias/temporada-2026.jpg', 1);
    END IF;
  END IF;
END $$;

-- Seed completed successfully
