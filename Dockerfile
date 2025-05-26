# Usa la imagen oficial de Node.js LTS
FROM node:18-alpine AS base

# Instala las dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala todas las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Stage para desarrollo
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Stage para build
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Stage para producción
FROM node:18-alpine AS production

# Instala las dependencias del sistema necesarias para TypeORM
RUN apk add --no-cache python3 make g++

# Crea un usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json e instala TODAS las dependencias (incluyendo dev) para ts-node-dev
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copia el código compilado desde build
COPY --from=build /app/dist ./dist

# Copia archivos de configuración necesarios
COPY --from=build /app/tsconfig.json ./

# Copia el directorio src para las migraciones y configuración de TypeORM
COPY --from=build /app/src ./src

# Cambia el propietario de los archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expone el puerto de la aplicación
EXPOSE 4000

# Comando que ejecuta migraciones y luego inicia la aplicación en modo desarrollo
CMD ["sh", "-c", "npm run run-migrations && npm run dev"]