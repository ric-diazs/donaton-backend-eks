import { prisma } from '@/src/lib/prisma'
import { Prisma } from '@prisma/client'

/**
* Capa 'repository' para operaciones CRUD de entidad 'Donacion' de Prisma
*
* Aca solo se delega la logica de acceso a la base de datos gestionada por el ORM Prisma.
*/
export const donacionRepository = {
  /**
  * Crea una nueva donacion.
  *
  * @param data - Contiene los campos necesarios para registrar una donacion
  *
  * @returns Regresa la entidad 'Donacion' generada por Prisma. Si los datos del donante ('donanteNombre' y 'donanteCorreo')
  *          vienen incluidos en los datos de registro, se crea el registro relacionado a 'donante' dentro de esta
  *          transaccion.
  */

  crear(data: Prisma.DonacionCreateInput) {
      return prisma.donacion.create({ data });
  },

  /*
  crear(data: {
    tipo: string
    cantidad: number
    unidad: string
    origen: string
    donanteNombre?: string
    donanteCorreo?: string
  }) {
    return prisma.donacion.create({
      data: {
        tipo: data.tipo,
        cantidad: data.cantidad,
        unidad: data.unidad,
        origen: data.origen,
        estado: 'PENDIENTE',
        donante: data.donanteCorreo
          ? {
              create: {
                nombre: data.donanteNombre ?? 'Anónimo',
                correo: data.donanteCorreo,
              },
            }
          : undefined,
      },
    })
  },*/

  listarTodas() {
  /**
  * Lista todas las donaciones ordenadas por atributo 'fecha' de forma descendente.
  *
  * @returns Regresa una lista con las donaciones. Si no hay donaciones registradas, regresa una lista vacia ([]).
  */
    return prisma.donacion.findMany({
      orderBy: { fecha: 'desc' },
    })
  },

  buscarPorId(id: number) {
  /**
  * Busca una donacion filtrada por su identificador o 'id'.
  *
  * @param {number} id - Identificador numerico de la donacion a buscar.
  *
  * @returns Regresa la donacion encontrada por su 'id'. Si esta no existe, se retorna el valor 'null'
  */
    return prisma.donacion.findUnique({
      where: { id },
    })
  },

  // Actualizar una donación (estado, ot, necesidadId, etc.)
  actualizar(id: number, data: Prisma.DonacionUpdateInput) {
  /**
  * Actualiza una donacion filtrada por su identificador mediante un cuerpo de datos a modificar de
  * esa donacion.
  *
  * @param {number} id - Identificador numerico de la donacion a buscar.
  * @param data - Objeto con campos a actualizar.
  *
  * @returns Regresa entidad 'Donacion' actualizada si es encontrado por su 'id'
  *
  * @throws {PrismaClientKnownRequestError} Si donacion buscada por 'id' no existe, se regresa error generado por Prisma.
  */
    return prisma.donacion.update({
      where: { id },
      data,
    })
  },
}