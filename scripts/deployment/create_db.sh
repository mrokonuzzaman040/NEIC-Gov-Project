#!/bin/bash
set -euo pipefail

# ========================
# Config – change if needed
# ========================
# Tip: you can override this by exporting DATABASE_URL before running the script.
: "${DATABASE_URL:=postgresql://postgres:postgres@localhost:5432/election_commission}"

echo "Using DATABASE_URL: $DATABASE_URL"

# ========================
# Install PostgreSQL
# ========================
echo "[1/4] Installing PostgreSQL..."
sudo apt update -y
sudo apt install -y postgresql postgresql-contrib

echo "[2/4] Enabling and starting PostgreSQL..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

# ========================
# Parse DATABASE_URL
# ========================
USER=$(echo "$DATABASE_URL" | sed -E 's#postgresql://([^:]+):.*#\1#')
PASSWORD=$(echo "$DATABASE_URL" | sed -E 's#postgresql://[^:]+:([^@]+)@.*#\1#')
HOST=$(echo "$DATABASE_URL" | sed -E 's#postgresql://[^@]+@([^:]+):.*#\1#')
PORT=$(echo "$DATABASE_URL" | sed -E 's#postgresql://[^@]+@[^:]+:([0-9]+)/.*#\1#')
DBNAME=$(echo "$DATABASE_URL" | sed -E 's#postgresql://.*/([^/?]+).*#\1#')

echo "[3/4] Parsed -> USER=$USER HOST=$HOST PORT=$PORT DBNAME=$DBNAME"

# ========================
# Set password for role (if role exists) or create it
# ========================
# We use the 'postgres' superuser to run admin commands.
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$USER'" | grep -q 1; then
  echo "Role '$USER' exists. Updating password..."
  sudo -u postgres psql -c "ALTER USER \"$USER\" WITH PASSWORD '$PASSWORD';"
else
  echo "Role '$USER' does not exist. Creating it..."
  sudo -u postgres psql -c "CREATE ROLE \"$USER\" WITH LOGIN PASSWORD '$PASSWORD';"
fi

# ========================
# Create database if missing and grant access
# ========================
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '$DBNAME'" | grep -q 1; then
  echo "[4/4] Database '$DBNAME' already exists."
else
  echo "[4/4] Creating database '$DBNAME'..."
  sudo -u postgres psql -c "CREATE DATABASE \"$DBNAME\" OWNER \"$USER\";"
fi

# Optional: ensure privileges on DB (safe to re-run)
sudo -u postgres psql -d "$DBNAME" -c "GRANT ALL PRIVILEGES ON DATABASE \"$DBNAME\" TO \"$USER\";" >/dev/null || true

echo "✅ PostgreSQL is ready. Database '$DBNAME' is available for '$USER'."

# ========================
# Helpful output
# ========================
cat <<EOF

Next steps:
1) Make sure your app's .env has the EXACT same URL this script used:
   DATABASE_URL="$DATABASE_URL"

2) If you're using Prisma:
   npx prisma generate
   npx prisma migrate deploy      # or 'migrate dev' for local dev

Troubleshooting:
- If Prisma still says "database does not exist", confirm your app's DATABASE_URL matches '$DBNAME'.
- To inspect DBs:      sudo -u postgres psql -c "\\l"
- To inspect roles:    sudo -u postgres psql -c "\\du"
- To connect manually: PGPASSWORD="$PASSWORD" psql -h $HOST -p $PORT -U $USER -d $DBNAME

EOF