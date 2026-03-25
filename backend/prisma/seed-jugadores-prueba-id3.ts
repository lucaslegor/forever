import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DISCIPLINA_ID_PRUEBA = 3;

type JugadorSeed = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNac: string; // YYYY-MM-DD
  genero: 'Masculino' | 'Femenino';
  categoria: 'Mayores' | 'Juveniles' | 'Infantiles';
};

const JUGADORES: JugadorSeed[] = [
  { nombre: 'Juan', apellido: 'Perez', dni: '40111222', fechaNac: '2002-03-12', genero: 'Masculino', categoria: 'Mayores' },
  { nombre: 'Lucas', apellido: 'Gomez', dni: '40111333', fechaNac: '2001-08-20', genero: 'Masculino', categoria: 'Mayores' },
  { nombre: 'Mateo', apellido: 'Fernandez', dni: '42111444', fechaNac: '2008-05-10', genero: 'Masculino', categoria: 'Juveniles' },
  { nombre: 'Nicolas', apellido: 'Lopez', dni: '43111555', fechaNac: '2010-11-01', genero: 'Masculino', categoria: 'Infantiles' },
  { nombre: 'Tomas', apellido: 'Ruiz', dni: '44111666', fechaNac: '2011-06-15', genero: 'Masculino', categoria: 'Infantiles' },
  { nombre: 'Sofia', apellido: 'Martinez', dni: '40111777', fechaNac: '2003-01-18', genero: 'Femenino', categoria: 'Mayores' },
  { nombre: 'Valentina', apellido: 'Diaz', dni: '40111888', fechaNac: '2004-07-07', genero: 'Femenino', categoria: 'Mayores' },
  { nombre: 'Camila', apellido: 'Torres', dni: '42111999', fechaNac: '2009-04-22', genero: 'Femenino', categoria: 'Juveniles' },
  { nombre: 'Martina', apellido: 'Sosa', dni: '43111001', fechaNac: '2010-09-30', genero: 'Femenino', categoria: 'Infantiles' },
  { nombre: 'Julieta', apellido: 'Vega', dni: '44111002', fechaNac: '2012-02-14', genero: 'Femenino', categoria: 'Infantiles' },
];

async function main() {
  console.log('🌱 Seed jugadores de prueba para disciplina existente id=3...');

  // Asegurar catálogos base por si faltan
  await prisma.genero.createMany({
    data: [{ nombre: 'Masculino' }, { nombre: 'Femenino' }],
    skipDuplicates: true,
  });

  await prisma.categoria.createMany({
    data: [{ nombre: 'Mayores' }, { nombre: 'Juveniles' }, { nombre: 'Infantiles' }],
    skipDuplicates: true,
  });

  const disciplina = await prisma.disciplina.findUnique({
    where: { id: DISCIPLINA_ID_PRUEBA },
  });

  if (!disciplina) {
    throw new Error(`No existe disciplina con id=${DISCIPLINA_ID_PRUEBA}.`);
  }

  const [generos, categorias, subcategorias] = await Promise.all([
    prisma.genero.findMany(),
    prisma.categoria.findMany(),
    prisma.subcategoria.findMany({
      where: { disciplinaId: DISCIPLINA_ID_PRUEBA },
    }),
  ]);

  const generoByNombre = new Map(generos.map((g) => [g.nombre, g.id]));
  const categoriaByNombre = new Map(categorias.map((c) => [c.nombre, c.id]));

  const getSubcategoriaId = (categoriaId: number, generoId: number) => {
    const match = subcategorias.find(
      (s) => s.categoriaId === categoriaId && (s.generoId === generoId || s.generoId === null)
    );
    return match?.id ?? null;
  };

  for (const j of JUGADORES) {
    const generoId = generoByNombre.get(j.genero);
    const categoriaId = categoriaByNombre.get(j.categoria);

    if (!generoId || !categoriaId) {
      throw new Error(`No se pudieron resolver IDs para ${j.dni}`);
    }

    const subcategoriaId = getSubcategoriaId(categoriaId, generoId);
    const passwordHash = await bcrypt.hash(j.dni, 10); // password = DNI
    const email = `${j.dni}@prueba.local`;

    const existente = await prisma.deportista.findUnique({
      where: { dni: j.dni },
    });

    if (existente) {
      // Solo actualiza cuenta vinculada y datos del deportista existente por DNI
      await prisma.cuentaUsuario.update({
        where: { id: existente.cuentaId },
        data: {
          email,
          password: passwordHash,
          rol: Rol.DEPORTISTA,
          activo: true,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
      });

      await prisma.deportista.update({
        where: { id: existente.id },
        data: {
          nombre: j.nombre,
          apellido: j.apellido,
          fechaNac: new Date(j.fechaNac),
          generoId,
          categoriaId,
          subcategoriaId,
          disciplinaId: DISCIPLINA_ID_PRUEBA,
        },
      });
      continue;
    }

    const cuenta = await prisma.cuentaUsuario.create({
      data: {
        email,
        password: passwordHash,
        rol: Rol.DEPORTISTA,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });

    await prisma.deportista.create({
      data: {
        nombre: j.nombre,
        apellido: j.apellido,
        dni: j.dni,
        fechaNac: new Date(j.fechaNac),
        generoId,
        categoriaId,
        subcategoriaId,
        disciplinaId: DISCIPLINA_ID_PRUEBA,
        cuentaId: cuenta.id,
      },
    });
  }

  console.log(`✅ Seed finalizado: ${JUGADORES.length} jugadores en disciplina id=${DISCIPLINA_ID_PRUEBA}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed-jugadores-prueba-id3:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
