#!/bin/bash

# Test Environment Variables Script
echo "🔍 Testing Environment Variables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

echo "✅ .env.local file found"

# Source the environment file
source .env.local

# Test key variables
echo ""
echo "📋 Testing Environment Variables:"
echo "=================================="

# Test DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL: $DATABASE_URL"
else
    echo "❌ DATABASE_URL: Not set"
fi

# Test NEXTAUTH_URL
if [ -n "$NEXTAUTH_URL" ]; then
    echo "✅ NEXTAUTH_URL: $NEXTAUTH_URL"
else
    echo "❌ NEXTAUTH_URL: Not set"
fi

# Test NEXTAUTH_SECRET
if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "✅ NEXTAUTH_SECRET: [HIDDEN]"
else
    echo "❌ NEXTAUTH_SECRET: Not set"
fi

# Test HASH_SALT
if [ -n "$HASH_SALT" ]; then
    echo "✅ HASH_SALT: [HIDDEN]"
else
    echo "❌ HASH_SALT: Not set"
fi

# Test REDIS_URL
if [ -n "$REDIS_URL" ]; then
    echo "✅ REDIS_URL: $REDIS_URL"
else
    echo "❌ REDIS_URL: Not set"
fi

# Test REDIS_PASSWORD
if [ -n "$REDIS_PASSWORD" ]; then
    echo "✅ REDIS_PASSWORD: [HIDDEN]"
else
    echo "❌ REDIS_PASSWORD: Not set"
fi

echo ""
echo "🔧 Testing Docker Compose Configuration..."
docker-compose config --quiet
if [ $? -eq 0 ]; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration has errors"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "Environment file: .env.local"
echo "Docker Compose: $(docker-compose config --quiet && echo 'Valid' || echo 'Invalid')"
echo ""
echo "🚀 Ready to run: docker-compose up --build -d"
