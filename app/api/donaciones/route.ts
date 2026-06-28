import { NextResponse } from 'next/server'
import { donacionService } from '@/src/service/donacion.service'

/**
* El codigo contenido en este archivo corresponde a las funciones que permiten la ejecucion de metodos
* HTTP de /api/donaciones.
*
*/

export async function GET() {
  /**
  * Metodo GET: Lista todas las donaciones registradas en la base de datos
  *
  * @returns Regresa un objeto JSON con una lista de todas las donaciones registradas. Si ocurre
  *          algun error en el proceso de ejecucion del metodo GET, regresa un objeto JSON con
  *          un mensaje de error junto con el status code 500 ("server error").
  */
  try {
    const donaciones = await donacionService.listarTodas()
    return NextResponse.json(donaciones)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las donaciones' },
      { status: 500 }
    )
  }
}

// POST /api/donaciones → crear (lo usa el donante)
export async function POST(request: Request) {
  /**
  * Metodo POST: Crea una nueva donacion
  *
  * @param {Request} request - Request (peticion) con el body de los datos de registro de una donacion en formato JSON
  *
  * @returns Regresa un objeto JSON con la donacion registrada junto con el status code 201 ("created"). Si ocurre
  *          algun error en el proceso, regresa un objeto JSON con un mensaje de error generado en el service o por
  *          el sistema junto con el status code 400 ("bad request").
  */
  try {
    const body = await request.json()
    const donacion = await donacionService.crear(body)
    return NextResponse.json(donacion, { status: 201 })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear la donación'
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}