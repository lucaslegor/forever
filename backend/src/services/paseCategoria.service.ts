import prisma from '../config/prisma';

/** Orden de subcategorías Infantiles Fútbol masculino (menor a mayor). */
const INFANTILES_ORDEN = ['6 años', '7 años', '8 años', '9 años', '10 años', '11 años'];

/** Orden de subcategorías Juveniles Fútbol masculino (menor a mayor). */
const JUVENILES_ORDEN = ['Pre-novena', 'Novena', 'Octava', 'Séptima', 'Sexta', 'Quinta'];

/** Nombre de la subcategoría en Mayores a la que pasa Quinta. */
const MAYORES_CUARTA = 'Cuarta';

export interface PaseCategoriaResult {
  actualizados: number;
  detalle: Array<{
    deportistaId: number;
    nombreCompleto: string;
    desde: string;
    hacia: string;
  }>;
  errores: string[];
}

/**
 * Ejecuta el pase de categoría anual para Fútbol masculino.
 * - Infantiles: 6→7→8→9→10→11; 11 años → Pre-novena (Juveniles).
 * - Juveniles: Pre-novena→…→Quinta; Quinta → Cuarta (Mayores).
 * - Mayores no se modifica.
 */
export async function ejecutarPaseCategoriaFutbolMasculino(): Promise<PaseCategoriaResult> {
  const detalle: PaseCategoriaResult['detalle'] = [];
  const errores: string[] = [];

  const disciplina = await prisma.disciplina.findFirst({
    where: { nombre: { in: ['Futbol', 'Fútbol'] } },
  });
  if (!disciplina) {
    throw new Error('Disciplina Fútbol no encontrada');
  }

  const genero = await prisma.genero.findFirst({
    where: { nombre: 'Masculino' },
  });
  if (!genero) {
    throw new Error('Género Masculino no encontrado');
  }

  const [infantiles, juveniles, mayores] = await Promise.all([
    prisma.categoria.findFirst({ where: { nombre: 'Infantiles' } }),
    prisma.categoria.findFirst({ where: { nombre: 'Juveniles' } }),
    prisma.categoria.findFirst({ where: { nombre: 'Mayores' } }),
  ]);

  if (!infantiles || !juveniles || !mayores) {
    throw new Error('Faltan categorías Infantiles, Juveniles o Mayores');
  }

  const subcategorias = await prisma.subcategoria.findMany({
    where: {
      disciplinaId: disciplina.id,
      generoId: genero.id,
      categoriaId: { in: [infantiles.id, juveniles.id, mayores.id] },
    },
    include: { categoria: true },
  });

  const mapSubcat = (categoriaId: number, nombre: string) =>
    subcategorias.find((s) => s.categoriaId === categoriaId && s.nombre === nombre);

  const deportistas = await prisma.deportista.findMany({
    where: {
      disciplinaId: disciplina.id,
      generoId: genero.id,
      categoriaId: { in: [infantiles.id, juveniles.id] },
      subcategoriaId: { not: null },
    },
    include: {
      subcategoria: true,
      categoria: true,
    },
  });

  for (const d of deportistas) {
    const sub = d.subcategoria;
    const cat = d.categoria;
    if (!sub) continue;

    const nombreSub = sub.nombre;
    let nuevaCategoriaId: number;
    let nuevaSubcategoriaId: number | null = null;

    if (cat.nombre === 'Infantiles') {
      const idx = INFANTILES_ORDEN.indexOf(nombreSub);
      if (idx === -1) {
        errores.push(`Deportista ${d.id} (${d.nombre} ${d.apellido}): subcategoría "${nombreSub}" no reconocida en Infantiles`);
        continue;
      }
      if (idx === INFANTILES_ORDEN.length - 1) {
        const preNovena = mapSubcat(juveniles.id, JUVENILES_ORDEN[0]);
        if (!preNovena) {
          errores.push(`Subcategoría "Pre-novena" (Juveniles) no encontrada`);
          continue;
        }
        nuevaCategoriaId = juveniles.id;
        nuevaSubcategoriaId = preNovena.id;
      } else {
        const siguienteNombre = INFANTILES_ORDEN[idx + 1];
        const siguiente = mapSubcat(infantiles.id, siguienteNombre);
        if (!siguiente) {
          errores.push(`Subcategoría "${siguienteNombre}" (Infantiles) no encontrada`);
          continue;
        }
        nuevaCategoriaId = infantiles.id;
        nuevaSubcategoriaId = siguiente.id;
      }
    } else if (cat.nombre === 'Juveniles') {
      const idx = JUVENILES_ORDEN.indexOf(nombreSub);
      if (idx === -1) {
        errores.push(`Deportista ${d.id} (${d.nombre} ${d.apellido}): subcategoría "${nombreSub}" no reconocida en Juveniles`);
        continue;
      }
      if (idx === JUVENILES_ORDEN.length - 1) {
        const cuarta = mapSubcat(mayores.id, MAYORES_CUARTA);
        if (!cuarta) {
          errores.push(`Subcategoría "Cuarta" (Mayores) no encontrada`);
          continue;
        }
        nuevaCategoriaId = mayores.id;
        nuevaSubcategoriaId = cuarta.id;
      } else {
        const siguienteNombre = JUVENILES_ORDEN[idx + 1];
        const siguiente = mapSubcat(juveniles.id, siguienteNombre);
        if (!siguiente) {
          errores.push(`Subcategoría "${siguienteNombre}" (Juveniles) no encontrada`);
          continue;
        }
        nuevaCategoriaId = juveniles.id;
        nuevaSubcategoriaId = siguiente.id;
      }
    } else {
      continue;
    }

    const desde = `${cat.nombre} - ${nombreSub}`;
    const nuevaSub = subcategorias.find((s) => s.id === nuevaSubcategoriaId);
    const hacia = nuevaSub ? `${nuevaSub.categoria.nombre} - ${nuevaSub.nombre}` : '';

    await prisma.deportista.update({
      where: { id: d.id },
      data: {
        categoriaId: nuevaCategoriaId,
        subcategoriaId: nuevaSubcategoriaId,
      },
    });

    detalle.push({
      deportistaId: d.id,
      nombreCompleto: `${d.nombre} ${d.apellido}`,
      desde,
      hacia,
    });
  }

  return {
    actualizados: detalle.length,
    detalle,
    errores,
  };
}
