import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de datos...');

    // 1. Crear Géneros y Categorías
    await prisma.genero.createMany({
        data: [{ nombre: 'Masculino' }, { nombre: 'Femenino' }],
        skipDuplicates: true,
    });

    await prisma.categoria.createMany({
        data: [{ nombre: 'Mayores' }, { nombre: 'Juveniles' }, { nombre: 'Infantiles' }],
        skipDuplicates: true,
    });

    console.log('✅ Géneros y categorías creados');

    // 2. Crear Disciplinas (solo Fútbol y Hockey)
    await prisma.disciplina.createMany({
        data: [
            { nombre: 'Futbol', precioMensual: 15000, activa: true },
            { nombre: 'Hockey', precioMensual: 18000, activa: true },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Disciplinas creadas (Fútbol y Hockey)');

    // 3. Crear Subcategorías (mismo modelo que la migración SQL)
    const [generos, categorias, disciplinas] = await Promise.all([
        prisma.genero.findMany(),
        prisma.categoria.findMany(),
        prisma.disciplina.findMany(),
    ]);

    const findGenero = (nombre: string) => generos.find((g) => g.nombre === nombre);
    const findCategoria = (nombre: string) => categorias.find((c) => c.nombre === nombre);
    const findDisciplina = (nombre: string) => disciplinas.find((d) => d.nombre === nombre);

    const futbol = findDisciplina('Futbol');
    const hockey = findDisciplina('Hockey');
    const masculino = findGenero('Masculino');
    const femenino = findGenero('Femenino');
    const mayores = findCategoria('Mayores');
    const juveniles = findCategoria('Juveniles');
    const infantiles = findCategoria('Infantiles');

    if (!futbol || !hockey || !masculino || !femenino || !mayores || !juveniles || !infantiles) {
        console.warn('⚠️ No se pudieron resolver todos los IDs para crear subcategorías.');
    } else {
        await prisma.subcategoria.createMany({
            data: [
                // Fútbol Mayores Masculino
                { nombre: 'Cuarta', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: masculino.id },
                { nombre: 'Reserva', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: masculino.id },
                { nombre: 'Senior', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: masculino.id },
                { nombre: 'Primera', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: masculino.id },
                // Fútbol Mayores Femenino
                { nombre: 'Cuarta', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: femenino.id },
                { nombre: 'Tercera', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: femenino.id },
                { nombre: '+35', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: femenino.id },
                { nombre: 'Primera', disciplinaId: futbol.id, categoriaId: mayores.id, generoId: femenino.id },
                // Fútbol Juveniles Masculino
                { nombre: 'Pre-novena', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                { nombre: 'Novena', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                { nombre: 'Octava', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                { nombre: 'Séptima', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                { nombre: 'Sexta', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                { nombre: 'Quinta', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: masculino.id },
                // Fútbol Infantiles Masculino
                { nombre: '6 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                { nombre: '7 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                { nombre: '8 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                { nombre: '9 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                { nombre: '10 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                { nombre: '11 años', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: masculino.id },
                // Fútbol Juveniles Femenino
                { nombre: 'Sub 10', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: femenino.id },
                { nombre: 'Sub 11', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: femenino.id },
                { nombre: 'Sub 12', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: femenino.id },
                { nombre: 'Sub 13', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: femenino.id },
                { nombre: 'Sub 14', disciplinaId: futbol.id, categoriaId: juveniles.id, generoId: femenino.id },
                // Fútbol Infantiles Femenino
                { nombre: 'Sub 10', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: femenino.id },
                { nombre: 'Sub 11', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: femenino.id },
                { nombre: 'Sub 12', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: femenino.id },
                { nombre: 'Sub 13', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: femenino.id },
                { nombre: 'Sub 14', disciplinaId: futbol.id, categoriaId: infantiles.id, generoId: femenino.id },
                // Hockey Mayores (sin género)
                { nombre: 'Intermedia', disciplinaId: hockey.id, categoriaId: mayores.id, generoId: null },
                { nombre: 'Primera', disciplinaId: hockey.id, categoriaId: mayores.id, generoId: null },
                // Hockey Juveniles (sin género)
                { nombre: 'Sub 14', disciplinaId: hockey.id, categoriaId: juveniles.id, generoId: null },
                { nombre: 'Sub 17', disciplinaId: hockey.id, categoriaId: juveniles.id, generoId: null },
                // Hockey Infantiles (sin género)
                { nombre: '10ma', disciplinaId: hockey.id, categoriaId: infantiles.id, generoId: null },
                { nombre: '9na', disciplinaId: hockey.id, categoriaId: infantiles.id, generoId: null },
                { nombre: '8va', disciplinaId: hockey.id, categoriaId: infantiles.id, generoId: null },
            ],
            skipDuplicates: true,
        });

        console.log('✅ Subcategorías creadas/aseguradas');
    }

    console.log('🎉 Seed de clasificación completado exitosamente!');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
