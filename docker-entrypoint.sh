#!/bin/sh
set -e

echo "⏳ Conectando ao PostgreSQL e sincronizando schema via Prisma..."
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss

echo "🚀 Iniciando servidor da aplicação..."
exec "$@"
