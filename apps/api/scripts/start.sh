#!/bin/bash
set -e

echo "=== crmFast API Production Start ==="

echo "1/4 - Generating Prisma client..."
npx prisma generate

echo "2/4 - Running database migrations..."
npx prisma migrate deploy

echo "3/4 - Seeding database (idempotent)..."
node dist/src/seed

echo "4/4 - Starting API server..."
exec node dist/src/main
