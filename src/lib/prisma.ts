import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient en modo “singleton” para evitar crear múltiples instancias en dev.
 *
 * Esto se debe a que NextJS recrea a 'PrismaClient' en cada reload y eso puede genera
 * conexiones extra, haciendo que utilice mas memoria de lo necesario. Con este patron,
 * se reusa una instancia global.
 *
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
* Creacion de instancia unica de 'PrismaClient' para la aplicacion
*/
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

// La instancia 'prisma' se almacena solo si no se esta en un entorno de produccion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}