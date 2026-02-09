import { PrismaClient, Rol, EstadoDeportista, EstadoCuota, EstadoPago, Periodicidad } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de datos...');

    // Limpiar datos existentes (opcional)
    await prisma.pago.deleteMany();
    await prisma.cuota.deleteMany();
    await prisma.grupoFamiliarIntegrante.deleteMany();
    await prisma.grupoFamiliar.deleteMany();
    await prisma.deportista.deleteMany();
    await prisma.administrativo.deleteMany();
    await prisma.cuentaUsuario.deleteMany();
    await prisma.subcategoria.deleteMany();
    await prisma.disciplina.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.genero.deleteMany();

    console.log('✅ Datos antiguos eliminados');

    // 1. Crear Géneros y Categorías
    const masculino = await prisma.genero.create({ data: { nombre: 'Masculino' } });
    const femenino = await prisma.genero.create({ data: { nombre: 'Femenino' } });
    const mayores = await prisma.categoria.create({ data: { nombre: 'Mayores' } });
    const juveniles = await prisma.categoria.create({ data: { nombre: 'Juveniles' } });
    const infantiles = await prisma.categoria.create({ data: { nombre: 'Infantiles' } });
    console.log('✅ Géneros y categorías creados');

    // 2. Crear Disciplinas
    const futbol = await prisma.disciplina.create({
        data: {
            nombre: 'Fútbol',
            precioMensual: 15000,
            activa: true,
        },
    });

    const natacion = await prisma.disciplina.create({
        data: {
            nombre: 'Natación',
            precioMensual: 18000,
            activa: true,
        },
    });

    const tenis = await prisma.disciplina.create({
        data: {
            nombre: 'Tenis',
            precioMensual: 20000,
            activa: true,
        },
    });

    console.log('✅ Disciplinas creadas');

    // 3. Crear Cuentas de Usuario y Administrativos
    const hashedPassword = await bcrypt.hash('Admin123', 10);

    const adminCuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'admin@club.com',
            password: hashedPassword,
            rol: Rol.ADMIN,
            activo: true,
        },
    });

    await prisma.administrativo.create({
        data: {
            nombre: 'Carlos',
            apellido: 'Gómez',
            dni: '30123456',
            cuentaId: adminCuenta.id,
        },
    });

    const administrativoCuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'secretaria@club.com',
            password: hashedPassword,
            rol: Rol.ADMINISTRATIVO,
            activo: true,
        },
    });

    await prisma.administrativo.create({
        data: {
            nombre: 'María',
            apellido: 'Rodríguez',
            dni: '31234567',
            cuentaId: administrativoCuenta.id,
        },
    });

    console.log('✅ Administrativos creados');

    // 4. Crear Deportistas (sin domicilio/localidad)
    const deportista1Cuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'juan.perez@mail.com',
            password: await bcrypt.hash('Juan1234', 10),
            rol: Rol.DEPORTISTA,
            activo: true,
        },
    });

    const deportista1 = await prisma.deportista.create({
        data: {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '40123456',
            fechaNac: new Date('2005-03-15'),
            generoId: masculino.id,
            categoriaId: juveniles.id,
            estado: EstadoDeportista.AL_DIA,
            disciplinaId: futbol.id,
            cuentaId: deportista1Cuenta.id,
        },
    });

    const deportista2Cuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'maria.lopez@mail.com',
            password: await bcrypt.hash('Maria1234', 10),
            rol: Rol.DEPORTISTA,
            activo: true,
        },
    });

    const deportista2 = await prisma.deportista.create({
        data: {
            nombre: 'María',
            apellido: 'López',
            dni: '41234567',
            fechaNac: new Date('2008-07-20'),
            generoId: femenino.id,
            categoriaId: infantiles.id,
            estado: EstadoDeportista.AL_DIA,
            disciplinaId: natacion.id,
            cuentaId: deportista2Cuenta.id,
        },
    });

    const deportista3Cuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'pedro.gonzalez@mail.com',
            password: await bcrypt.hash('Pedro1234', 10),
            rol: Rol.DEPORTISTA,
            activo: true,
        },
    });

    const deportista3 = await prisma.deportista.create({
        data: {
            nombre: 'Pedro',
            apellido: 'González',
            dni: '39876543',
            fechaNac: new Date('2003-11-10'),
            generoId: masculino.id,
            categoriaId: mayores.id,
            estado: EstadoDeportista.EN_DEUDA,
            disciplinaId: tenis.id,
            cuentaId: deportista3Cuenta.id,
        },
    });

    const deportista4Cuenta = await prisma.cuentaUsuario.create({
        data: {
            email: 'ana.martinez@mail.com',
            password: await bcrypt.hash('Ana12345', 10),
            rol: Rol.DEPORTISTA,
            activo: false,
        },
    });

    const deportista4 = await prisma.deportista.create({
        data: {
            nombre: 'Ana',
            apellido: 'Martínez',
            dni: '42345678',
            fechaNac: new Date('2010-05-25'),
            generoId: femenino.id,
            categoriaId: infantiles.id,
            estado: EstadoDeportista.INACTIVA,
            disciplinaId: futbol.id,
            cuentaId: deportista4Cuenta.id,
        },
    });

    console.log('✅ Deportistas creados');

    // 5. Crear Grupo Familiar
    const grupoFamiliar1 = await prisma.grupoFamiliar.create({
        data: {
            nombre: 'Familia Pérez',
        },
    });

    await prisma.grupoFamiliarIntegrante.create({
        data: {
            grupoId: grupoFamiliar1.id,
            deportistaId: deportista1.id,
            esPrincipal: true,
        },
    });

    console.log('✅ Grupos familiares creados');

    // 6. Crear Cuotas
    const cuota1 = await prisma.cuota.create({
        data: {
            nroCuota: 1,
            anio: 2026,
            monto: futbol.precioMensual,
            fechaEmision: new Date('2026-01-01'),
            fechaVencimiento: new Date('2026-01-10'),
            estadoCuota: EstadoCuota.PAGADA,
            periodicidad: Periodicidad.MENSUAL,
            disciplinaId: futbol.id,
            deportistaId: deportista1.id,
        },
    });

    const cuota2 = await prisma.cuota.create({
        data: {
            nroCuota: 2,
            anio: 2026,
            monto: futbol.precioMensual,
            fechaEmision: new Date('2026-02-01'),
            fechaVencimiento: new Date('2026-02-10'),
            estadoCuota: EstadoCuota.PENDIENTE,
            periodicidad: Periodicidad.MENSUAL,
            disciplinaId: futbol.id,
            deportistaId: deportista1.id,
        },
    });

    const cuota3 = await prisma.cuota.create({
        data: {
            nroCuota: 1,
            anio: 2026,
            monto: natacion.precioMensual,
            fechaEmision: new Date('2026-01-01'),
            fechaVencimiento: new Date('2026-01-10'),
            estadoCuota: EstadoCuota.PAGADA,
            periodicidad: Periodicidad.MENSUAL,
            disciplinaId: natacion.id,
            deportistaId: deportista2.id,
        },
    });

    const cuota4 = await prisma.cuota.create({
        data: {
            nroCuota: 1,
            anio: 2025,
            monto: tenis.precioMensual,
            fechaEmision: new Date('2025-12-01'),
            fechaVencimiento: new Date('2025-12-10'),
            estadoCuota: EstadoCuota.VENCIDA,
            periodicidad: Periodicidad.MENSUAL,
            disciplinaId: tenis.id,
            deportistaId: deportista3.id,
        },
    });

    const cuota5 = await prisma.cuota.create({
        data: {
            nroCuota: 2,
            anio: 2026,
            monto: tenis.precioMensual,
            fechaEmision: new Date('2026-01-01'),
            fechaVencimiento: new Date('2026-01-10'),
            estadoCuota: EstadoCuota.VENCIDA,
            periodicidad: Periodicidad.MENSUAL,
            disciplinaId: tenis.id,
            deportistaId: deportista3.id,
        },
    });

    console.log('✅ Cuotas creadas');

    // 7. Crear Pagos
    await prisma.pago.create({
        data: {
            fechaPago: new Date('2026-01-05'),
            monto: futbol.precioMensual,
            estadoPago: EstadoPago.APROBADO,
            medioPago: 'Transferencia',
            cuotaId: cuota1.id,
            deportistaId: deportista1.id,
        },
    });

    await prisma.pago.create({
        data: {
            fechaPago: new Date('2026-01-08'),
            monto: natacion.precioMensual,
            estadoPago: EstadoPago.APROBADO,
            medioPago: 'Efectivo',
            cuotaId: cuota3.id,
            deportistaId: deportista2.id,
        },
    });

    await prisma.pago.create({
        data: {
            fechaPago: new Date('2026-02-03'),
            monto: futbol.precioMensual,
            estadoPago: EstadoPago.PENDIENTE,
            medioPago: 'MercadoPago',
            mercadoPagoId: 'MP123456789',
            mercadoPagoStatus: 'pending',
            cuotaId: cuota2.id,
            deportistaId: deportista1.id,
        },
    });

    console.log('✅ Pagos creados');

    console.log('🎉 Seed completado exitosamente!');
    console.log('');
    console.log('📝 Credenciales de acceso:');
    console.log('');
    console.log('👤 Admin:');
    console.log('   Email: admin@club.com');
    console.log('   Password: Admin123');
    console.log('');
    console.log('👤 Administrativo:');
    console.log('   Email: secretaria@club.com');
    console.log('   Password: Admin123');
    console.log('');
    console.log('👤 Deportistas:');
    console.log('   Email: juan.perez@mail.com | Password: Juan1234');
    console.log('   Email: maria.lopez@mail.com | Password: Maria1234');
    console.log('   Email: pedro.gonzalez@mail.com | Password: Pedro1234');
    console.log('   Email: ana.martinez@mail.com | Password: Ana12345');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
