import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware para gestionar acceso externo a endpoints bajo `/api/*`.
 * Se encarga de agregar cabeceras CORS y de manejar solicitudes `OPTIONS`.
 *
 * @param request - Solicitud HTTP entrante.
 * @returns Respuesta con cabeceras CORS aplicadas. Para `OPTIONS` retorna 200 inmediato;
 *          en otros métodos retorna la continuación del flujo (`NextResponse.next()`).
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

/**
 * Configuración del middleware para aplicar la función `middleware` únicamente a rutas
 * que comienzan con `/api/`.
 */
export const config = {
  /**
   * Matcher que indica qué rutas activan el middleware.
   * @example '/api/:path*' aplica a `/api/...` incluyendo subrutas.
   */
  matcher: '/api/:path*',
}