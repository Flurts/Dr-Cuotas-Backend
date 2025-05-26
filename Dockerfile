# Usa la imagen oficial de Node.js LTS
FROM node:18-alpine AS base

# Instala las dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production && npm cache clean --force

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

# Instala PM2 globalmente
RUN npm install -g pm2

# Crea un usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias de producción desde base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Copia el código compilado desde build
COPY --from=build /app/dist ./dist

# Copia archivos de configuración necesarios
COPY --from=build /app/ecosystem.json* ./
COPY --from=build /app/tsconfig.json ./

# Copia el directorio src para las migraciones y configuración de TypeORM
COPY --from=build /app/src ./src

# Cambia el propietario de los archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expone el puerto de la aplicación
EXPOSE 4000

# Comando por defecto para producción
CMD ["npm", "run", "start:prod"]