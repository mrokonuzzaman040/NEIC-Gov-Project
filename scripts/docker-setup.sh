#!/bin/bash

# Docker Setup Script for Election Commission Portal
set -e

echo "🚀 Setting up Docker environment for Election Commission Portal..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your actual configuration values"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads temp-uploads docker/nginx/ssl

# Set proper permissions
chmod 755 uploads temp-uploads

print_status "Directories created with proper permissions"

# Build and start services
print_status "Building and starting services..."

# Use docker-compose or docker compose based on what's available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Build the application
print_status "Building application image..."
$COMPOSE_CMD build

# Start services
print_status "Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check if PostgreSQL is ready
if $COMPOSE_CMD exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_status "PostgreSQL is ready"
else
    print_error "PostgreSQL is not ready"
fi

# Check if Redis is ready
if $COMPOSE_CMD exec redis redis-cli ping > /dev/null 2>&1; then
    print_status "Redis is ready"
else
    print_error "Redis is not ready"
fi

# Run database migrations
print_status "Running database migrations..."
$COMPOSE_CMD exec app npx prisma migrate deploy

# Generate Prisma client
print_status "Generating Prisma client..."
$COMPOSE_CMD exec app npx prisma generate

# Seed initial data (optional)
read -p "Do you want to seed initial data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding initial data..."
    $COMPOSE_CMD exec app npm run db:seed
fi

print_status "Setup completed successfully!"
echo
echo "🌐 Application is available at: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo
echo "📋 Useful commands:"
echo "  View logs: $COMPOSE_CMD logs -f"
echo "  Stop services: $COMPOSE_CMD down"
echo "  Restart services: $COMPOSE_CMD restart"
echo "  Access app container: $COMPOSE_CMD exec app sh"
echo "  Access database: $COMPOSE_CMD exec postgres psql -U postgres -d election_commission"
echo
echo "🔧 Development tools (optional):"
echo "  Start with dev tools: $COMPOSE_CMD --profile dev-tools -f docker-compose.dev.yml up -d"
echo "  pgAdmin: http://localhost:8080"
echo "  Redis Commander: http://localhost:8081"
