# Backend Graphql with typeorm and typegraphql

Se ejecuta en un entorno Docker y utiliza TypeORM, TypeGraphql para la gestión de la base de datos.

## Requisitos

- Docker
- Node.js
- npm

## Instalación

1. Clona el repositorio de GitHub.
2. Ejecuta `npm install` para instalar las dependencias del proyecto.
3. Configura las variables de entorno necesarias en un archivo `.env`.

## Ejecución

1. Ejecuta `docker-compose up` para iniciar los servicios de Docker.
2. Ejecuta `npm run run-migrations` para ejecutar las migraciones de la base de datos.

## Scripts

- `npm run dev`: Inicia el servidor en modo de desarrollo.
- `npm run build`: Compila el proyecto a JavaScript.
- `npm run start:prod`: Inicia el servidor en modo de producción.
- `npm run typeorm`: Ejecuta el CLI de TypeORM.
- `npm run run-migrations`: Ejecuta las migraciones de la base de datos.
- `npm run gen-migration`: Genera una nueva migración.
- `npm run revert-migrations`: Revierte las migraciones de la base de datos.

## Licencia

Este proyecto está licenciado bajo la licencia ISC. Flurts.
