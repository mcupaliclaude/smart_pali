#!/bin/sh
set -e

echo "======================================================"
echo "🚀 Starting Smart Pali Production Environment"
echo "======================================================"

# 1. Run database migrations to keep schema in sync
echo "🗄️ Running Prisma database migrations..."
prisma migrate deploy --schema=./prisma/schema.prisma
echo "✅ Database schema is up to date."

# 2. Start Next.js standalone production server
echo "🌐 Starting Next.js standalone server on port ${PORT:-3010}..."
exec node server.js
