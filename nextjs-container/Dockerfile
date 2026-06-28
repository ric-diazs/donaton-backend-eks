# Dockerfile con multietapas

## Etapa 1: Instalacion de dependencias
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# En vez de ejecutar npm install, se ejecuta 'npm run ci' donde ci = clean install
RUN npm ci


## Etapa 2: Compilacion de la aplicacion
FROM node:20-alpine AS builder

WORKDIR /app

ARG DATABASE_URL
ARG SHADOW_DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV SHADOW_DATABASE_URL=$SHADOW_DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build


## Etapa 3: Ejecución de archivo compilado
FROM node:20-alpine AS runner

WORKDIR /app

# Para instalar dependencias dev, tales como Prisma
ENV NODE_ENV=development
COPY --from=builder /app/package*.json ./
RUN npm ci

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/prisma           ./prisma
#COPY --from=builder /app/public ./public

EXPOSE 3000

# La opcion 'standalone' en next.config.ts permite generar un 'server.js'
# luego de la compilacion, el cual es mas liviano para trabajar
CMD ["node", "server.js"]

