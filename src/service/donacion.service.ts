import { donacionRepository } from '@/src/repository/donacion.repository'
import { Prisma } from '@prisma/client'
//import { necesidadRepository } from '@/src/repository/necesidad.repository'
//import { EstadoDonacion } from '@prisma/client'

/**
 * Capa de service para operaciones relacionadas con entidad `Donacion`.
 *
 * En este archivo se abordan las reglas de negocio para las donaciones
 */

// Mapa de transiciones válidas: de qué estado a cuáles se puede avanzar
/*const transicionesValidas: Record<EstadoDonacion, EstadoDonacion[]> = {
  PENDIENTE: ['RECIBIDA'],
  RECIBIDA: ['DISPONIBLE'],
  DISPONIBLE: ['ASIGNADA'],
  ASIGNADA: ['EN_TRANSITO'],
  EN_TRANSITO: ['ENTREGADA'],
  ENTREGADA: [],
}*/

export const donacionService = {
  /**
  * Crea una nueva donacion
  *
  * Regla de negocio: Los campos obligatorios de los datos enviados desde el formulario de registro de donaciones
  *                   no deben estar vacios.
  *
  * @param data - Datos necesarios para registrar una donacion.
  *
  * @returns Regresa la entidad 'Donacion' creada si los datos son ingresados correctamente.
  *
  * @throws Si alguno o todos los campos obligatorios estan vacios, se lanza un mensaje de error.
  */
  
  async crear(data: Prisma.DonacionCreateInput) {
      if(!data.tipo || !data.cantidad || !data.donanteNombre) {
        throw new Error('Faltan campos obligatorios: tipo, cantidad, nombre del donante')
      }

      return donacionRepository.crear(data);
  },

  /*async crear(data: {
    tipo: string
    cantidad: number
    unidad: string
    origen: string
    donanteNombre?: string
    donanteCorreo?: string
  }) {
    // Se evalua que los campos obligatorios de la entidad 'Donacion' no esten vacios
    if (!data.tipo || !data.cantidad || !data.unidad || !data.origen) {
      throw new Error('Faltan campos obligatorios: tipo, cantidad, unidad, origen')
    }
    return donacionRepository.crear(data)
  },*/

  /**
  * Lista todas las donaciones registradas en la base de datos
  *
  * @returns Regresa una lista con todas las donaciones registradas.
  *
  */
  listarTodas() {
    return donacionRepository.listarTodas()
  },

  /**
  * Cambia el estado de una donación, validando que la transición sea permitida
  * y ejecutando efectos colaterales según el nuevo estado.
  *
  * Reglas de negocio aplicadas:
  *
  * - Si la donación no existe se lanza mensaje de error `NOT_FOUND`.
  * - La transición debe estar habilitada por `transicionesValidas`.
  * - Al pasar a `RECIBIDA` se genera un número de OT.
  * - Al pasar a `ASIGNADA` se requiere `necesidadId` y se actualiza la cobertura.
  *
  * @param {number} id - Identificador numerico de la donación.
  * @param {EstadoDonacion} nuevoEstado - Nuevo estado destino.
  * @param {number} necesidadId - Identificador de la necesidad (requerido al asignar).
  *
  * @returns Regresa la entidad 'Donacion' actualizada.
  *
  * @throws Si no existe la donacion, se envia mensaje de error `NOT_FOUND`.
  * @throws Se envia mensaje de error si la transicion no esta permitida.
  * @throws Si falta valor `ASIGNADA` para variable `necesidadId`, se levanta un mensaje de error.
  */
  //async cambiarEstado(
  //  id: number,
  //  nuevoEstado: EstadoDonacion,
  //  necesidadId?: number
  //) {
  //  const donacionActual = await donacionRepository.buscarPorId(id)

  //  if (!donacionActual) {
  //    throw new Error('NOT_FOUND')
  //  }

  //  const siguientesPermitidos = transicionesValidas[donacionActual.estado] ?? []

  //  // Si no hay un estado almacenado en las transacciones validas, se levanta error
  //  // indicando que se bloquea cambio de estado
  //  if (!siguientesPermitidos.includes(nuevoEstado)) {
  //    throw new Error(
  //      `No se puede pasar de ${donacionActual.estado} a ${nuevoEstado}`
  //    )
  //  }

  //  const data: Record<string, unknown> = { estado: nuevoEstado }

  //  
  //  /**
  //   * Regla de negocio: cuando la donación pasa a `RECIBIDA`,
  //   * se asigna un identificador de orden de trabajo (OT) construido
  //   * con el año actual y un correlativo basado en el id.
  //   */
  //  if (nuevoEstado === 'RECIBIDA') {
  //    const año = new Date().getFullYear()
  //    const numeroFormateado = String(donacionActual.id).padStart(4, '0')
  //    data.ot = `OT-${año}-${numeroFormateado}`
  //  }

  //  /**
  //   * Regla de negocio: al pasar a `ASIGNADA` se debe asociar la donación
  //   * a una `necesidad` específica (por eso se requiere `necesidadId`)
  //   * y se actualiza la cobertura de esa necesidad con la cantidad donada.
  //  */
  //  if (nuevoEstado === 'ASIGNADA') {
  //    if (!necesidadId) {
  //      throw new Error('Para asignar se requiere necesidadId')
  //    }
  //    data.necesidadId = necesidadId

  //    const necesidad = await necesidadRepository.buscarPorId(necesidadId)
  //    if (necesidad) {
  //      const nuevaCobertura = necesidad.cantCubierta + donacionActual.cantidad
  //      await necesidadRepository.actualizarCobertura(
  //        necesidad.id,
  //        nuevaCobertura,
  //        nuevaCobertura >= necesidad.cantRequerida ? 'CUBIERTA' : necesidad.estado
  //      )
  //    }
  //  }

  //  return donacionRepository.actualizar(id, data)
  //},
}