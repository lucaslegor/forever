/// <reference types="node" />
import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.PRINCIPAL_ADMIN_EMAIL || 'admin@foreverclub.com').trim().toLowerCase();
  const plainPassword = (process.env.PRINCIPAL_ADMIN_PASSWORD || 'Forever@2026').trim();

  if (!email || !email.includes('@')) {
    throw new Error('PRINCIPAL_ADMIN_EMAIL inválido.');
  }
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error('PRINCIPAL_ADMIN_PASSWORD inválido (min 6 chars).');
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const cuenta = await prisma.cuentaUsuario.upsert({
    where: { email },
    update: {
      password: passwordHash,
      rol: Rol.ADMIN,
      activo: true,
      intentosFallidos: 0,
      bloqueadoHasta: null,
    },
    create: {
      email,
      password: passwordHash,
      rol: Rol.ADMIN,
      activo: true,
      intentosFallidos: 0,
      bloqueadoHasta: null,
    },
  });

  // Perfil administrativo para mostrar nombre/apellido en UI (opcional)
  const existingAdminProfile = await prisma.administrativo.findUnique({ where: { cuentaId: cuenta.id } });
  if (!existingAdminProfile) {
    await prisma.administrativo.create({
      data: {
        nombre: process.env.PRINCIPAL_ADMIN_NOMBRE?.trim() || 'Admin',
        apellido: process.env.PRINCIPAL_ADMIN_APELLIDO?.trim() || 'Principal',
        // DNI ficticio: solo para cumplir el schema. Debe ser único.
        dni: (process.env.PRINCIPAL_ADMIN_DNI || '99999999').replace(/\D/g, ''),
        cuentaId: cuenta.id,
      },
    });
  }

  console.log(`✅ Admin principal listo: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error creando admin principal:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

