#!/bin/bash

# ========================
# Install PostgreSQL
# ========================
echo "Updating packages and installing PostgreSQL..."
sudo apt update -y
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo "PostgreSQL installation completed."

# ========================
# Database Configuration
# ========================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/election_commission_db"

# Extract parts of the URL
USER=$(echo $DATABASE_URL | sed -E 's#postgresql://([^:]+):.*#\1#')
PASSWORD=$(echo $DATABASE_URL | sed -E 's#postgresql://[^:]+:([^@]+)@.*#\1#')
HOST=$(echo $DATABASE_URL | sed -E 's#postgresql://[^@]+@([^:]+):.*#\1#')
PORT=$(echo $DATABASE_URL | sed -E 's#postgresql://[^@]+@[^:]+:([0-9]+)/.*#\1#')
DBNAME=$(echo $DATABASE_URL | sed -E 's#postgresql://.*/([^/]+)$#\1#')

# Set postgres password
echo "Setting postgres user password..."
sudo -u postgres psql -c "ALTER USER $USER WITH PASSWORD '$PASSWORD';"

# Create the database if it does not exist
echo "Checking if database '$DBNAME' exists..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DBNAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DBNAME"

echo "Database '$DBNAME' is ready."