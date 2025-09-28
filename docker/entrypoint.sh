#!/bin/sh
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL environment variable is required but not set." >&2
  exit 1
fi

export PATH="/app/node_modules/.bin:$PATH"

echo "Ensuring Prisma client is generated..."
npx prisma generate >/dev/null 2>&1 || echo "Prisma generate completed (warnings can be ignored if already generated)."

RETRY_COUNT=0
MAX_RETRIES=${DB_MIGRATION_MAX_RETRIES:-10}
SLEEP_SECONDS=${DB_MIGRATION_RETRY_DELAY:-5}

until npx prisma migrate deploy; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Database migrations failed after ${MAX_RETRIES} attempts." >&2
    exit 1
  fi
  echo "Database not ready yet (attempt ${RETRY_COUNT}/${MAX_RETRIES}). Retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done

echo "Database migrations applied successfully."

if [ "$(printf "%s" "${SEED_DATABASE}" | tr '[:upper:]' '[:lower:]')" = "true" ]; then
  echo "Seeding database with baseline data..."
  node scripts/master-seed.js || {
    echo "Database seeding failed." >&2
    exit 1
  }
fi

exec "$@"
