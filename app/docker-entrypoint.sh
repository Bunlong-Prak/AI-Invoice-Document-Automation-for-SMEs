#!/bin/sh
set -e

echo "🔄 Pushing database schema..."
npx drizzle-kit push --force
echo "✅ Database schema is up to date!"

echo "🚀 Starting Next.js dev server..."
exec npm run dev -- -H 0.0.0.0
