# Docker Deployment Guide

This guide covers how to deploy the Election Commission Portal using Docker containers.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   cd election-commission-portal
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual configuration values
   ```

3. **Run the setup script**
   ```bash
   ./scripts/docker-setup.sh
   ```

4. **Access the application**
   - Main application: http://localhost:3000
   - Health check: http://localhost:3000/api/health

## Manual Setup

If you prefer to set up manually:

1. **Build and start services**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Generate Prisma client**
   ```bash
   docker-compose exec app npx prisma generate
   ```

4. **Seed initial data (optional)**
   ```bash
   docker-compose exec app npm run db:seed
   ```

## Services

The Docker setup includes the following services:

### Core Services
- **app**: Next.js application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

### Optional Services (Development)
- **nginx**: Reverse proxy with SSL termination (ports 80, 443)
- **pgadmin**: PostgreSQL administration interface (port 8080)
- **redis-commander**: Redis administration interface (port 8081)

## Environment Variables

Key environment variables you need to configure in `.env`:

```bash
# Database
POSTGRES_DB=election_commission
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-redis-password

# Application
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Development Mode

For development with additional tools:

```bash
# Start with development tools
docker-compose --profile dev-tools -f docker-compose.dev.yml up -d

# Access pgAdmin at http://localhost:8080
# Access Redis Commander at http://localhost:8081
```

## Production Deployment

For production deployment:

1. **Use production environment variables**
2. **Enable SSL with nginx**
3. **Use external databases for better performance**
4. **Set up monitoring and logging**

```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d
```

## Useful Commands

### Service Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
```

### Database Operations
```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Reset database
docker-compose exec app npx prisma migrate reset

# Access database shell
docker-compose exec postgres psql -U postgres -d election_commission

# Backup database
docker-compose exec postgres pg_dump -U postgres election_commission > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres election_commission < backup.sql
```

### Application Operations
```bash
# Access application container
docker-compose exec app sh

# Run Prisma Studio
docker-compose exec app npx prisma studio

# Install new dependencies
docker-compose exec app npm install package-name

# Run tests
docker-compose exec app npm test
```

### Maintenance
```bash
# Update application
docker-compose pull
docker-compose build
docker-compose up -d

# Clean up unused images
docker image prune

# Clean up everything (including volumes)
docker-compose down -v
docker system prune -a
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   # Ensure database is ready before starting app
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **Redis connection issues**
   ```bash
   # Check Redis logs
   docker-compose logs redis
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

4. **Application not starting**
   ```bash
   # Check application logs
   docker-compose logs app
   # Check if all environment variables are set
   docker-compose exec app env | grep -E "(DATABASE_URL|REDIS_URL|NEXTAUTH)"
   ```

### Health Checks

Monitor service health:
```bash
# Check all services
docker-compose ps

# Check application health endpoint
curl http://localhost:3000/api/health

# Check individual services
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping
```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong secrets** for NEXTAUTH_SECRET
3. **Enable SSL/TLS** for production
4. **Configure firewall** to restrict access
5. **Regular security updates** for base images
6. **Use secrets management** for sensitive data

## Monitoring

For production monitoring, consider:
- Application performance monitoring (APM)
- Log aggregation (ELK stack, Fluentd)
- Metrics collection (Prometheus, Grafana)
- Health check monitoring
- Backup automation

## Support

For issues related to Docker deployment:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure all services are healthy
4. Check the troubleshooting section above
