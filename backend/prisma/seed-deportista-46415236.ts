import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const DNI = '46415236';
const PASSWORD = '46415236';
const EMAIL = `${DNI}@club.com`;

const prisma = new PrismaClient();

async function ensurePrismaColumns() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE deportistas ADD COLUMN IF NOT EXISTS obra_social TEXT'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE deportistas ADD COLUMN IF NOT EXISTS enfermedades TEXT'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE deportistas ADD COLUMN IF NOT EXISTS telefonos TEXT'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE disciplinas ADD COLUMN IF NOT EXISTS descripcion TEXT'
  );
}

async function main() {
  console.log(`🌱 Seed deportista DNI ${DNI}...`);

  await ensurePrismaColumns();

  const existing = await prisma.$queryRaw<Array<{ id_deportista: number; id_cuenta: number }>>`
    SELECT id_deportista, id_cuenta
    FROM deportistas
    WHERE dni = ${DNI}
    LIMIT 1
  `;

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  if (existing.length > 0) {
    await prisma.$executeRaw`
      UPDATE cuentas_usuario
      SET
        password = ${hashedPassword},
        rol = 'Deportista',
        activo = true,
        intentos_fallidos = 0,
        bloqueado_hasta = NULL,
        updated_at = NOW()
      WHERE id_cuenta = ${existing[0].id_cuenta}
    `;

    console.log('✅ Deportista ya existía; contraseña y cuenta actualizadas.');
    console.log(`   DNI: ${DNI} | Contraseña: ${PASSWORD}`);
    return;
  }

  let disciplina = await prisma.$queryRaw<Array<{ id_disciplina: number }>>`
    SELECT id_disciplina FROM disciplinas WHERE activa = true ORDER BY id_disciplina LIMIT 1
  `;

  if (disciplina.length === 0) {
    disciplina = await prisma.$queryRaw<Array<{ id_disciplina: number }>>`
      INSERT INTO disciplinas (nombre, precio_mensual, activa, created_at, updated_at)
      VALUES ('Futbol', 10000.00, true, NOW(), NOW())
      RETURNING id_disciplina
    `;
    console.log('✅ Disciplina base creada (Futbol).');
  }

  const genero = await prisma.$queryRaw<Array<{ id_genero: number }>>`
    SELECT id_genero FROM generos ORDER BY id_genero LIMIT 1
  `;

  const categoria = await prisma.$queryRaw<Array<{ id_categoria: number }>>`
    SELECT id_categoria FROM categorias ORDER BY id_categoria LIMIT 1
  `;

  if (genero.length === 0 || categoria.length === 0) {
    throw new Error('Faltan géneros o categorías en la base. Ejecutá las migraciones primero.');
  }

  const cuenta = await prisma.$queryRaw<Array<{ id_cuenta: number }>>`
    INSERT INTO cuentas_usuario (email, password, rol, activo, intentos_fallidos, created_at, updated_at)
    VALUES (${EMAIL}, ${hashedPassword}, 'Deportista', true, 0, NOW(), NOW())
    RETURNING id_cuenta
  `;

  await prisma.$executeRaw`
    INSERT INTO deportistas (
      nombre,
      apellido,
      dni,
      fecha_nac,
      estado,
      id_disciplina,
      id_cuenta,
      id_genero,
      id_categoria,
      becado,
      created_at,
      updated_at
    )
    VALUES (
      'Deportista',
      'Prueba',
      ${DNI},
      ${new Date('2000-01-01')},
      'Al dia',
      ${disciplina[0].id_disciplina},
      ${cuenta[0].id_cuenta},
      ${genero[0].id_genero},
      ${categoria[0].id_categoria},
      false,
      NOW(),
      NOW()
    )
  `;

  console.log('✅ Deportista creado.');
  console.log(`   DNI: ${DNI} | Contraseña: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
