#!/bin/bash

# Update and install Redis
echo "Updating package lists and installing Redis..."
sudo apt update -y
sudo apt install -y redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server
sudo systemctl start redis-server

echo "Redis installation completed."

# ========================
# REDIS Configuration
# ========================
KV_REST_API_URL="https://rich-jackal-6469.upstash.io"
KV_REST_API_TOKEN="ARjrASQ-NmRjZTg4OGQtMDRiMC00YTliLTk1NzQtMjk0MzE3ZTcwYTdiQVJsRkFBSW1jREpsWm1JMll6UTJNMlUwTldZME1USXdPVFk0TnpSalptTmpaR1UxWVdFNVlYQXlOalEyT1E="

# Save to environment file
echo "Configuring environment variables..."
cat <<EOL > ./redis_config.env
# REDIS Configuration
KV_REST_API_URL="$KV_REST_API_URL"
KV_REST_API_TOKEN="$KV_REST_API_TOKEN"
EOL

echo "Configuration saved to redis_config.env"

# Export variables for current session
export KV_REST_API_URL="$KV_REST_API_URL"
export KV_REST_API_TOKEN="$KV_REST_API_TOKEN"

echo "Environment variables exported. You can run 'source ./redis_config.env' in future sessions."