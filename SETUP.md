# Election Commission Portal - Setup Guide

This is a secure government portal for the National Elections Inquiry Commission of Bangladesh.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: NextAuth.js with role-based access control
- **Deployment**: Docker containers
- **Security**: Rate limiting, audit logging, secure headers

## 🔐 User Roles

1. **ADMIN** - Full system access, user management
2. **MANAGEMENT** - User management, audit logs, reports
3. **SUPPORT** - View submissions, basic operations
4. **VIEWER** - Read-only access

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (for production)

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://election_admin:SecureElectionDB2024!@localhost:5432/election_commission"

# NextAuth
NEXTAUTH_SECRET="YourSuperSecretKeyForElectionCommission2024!"
NEXTAUTH_URL="http://localhost:3000"

# Admin User (for initial setup)
ADMIN_EMAIL="admin@election-commission.gov.bd"
ADMIN_PASSWORD="SecureAdmin2024!"
ADMIN_NAME="System Administrator"

# Redis (for rate limiting)
REDIS_PASSWORD="SecureRedis2024!"

# Security
POSTGRES_PASSWORD="SecureElectionDB2024!"
```

### 2. Docker Setup (Recommended)

```bash
# Start PostgreSQL and Redis
npm run docker:up

# Wait for services to be ready, then run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Create initial admin user
npm run db:seed

# Install dependencies and start development server
npm install
npm run dev
```

### 3. Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
# Create database: election_commission
# Create user: election_admin

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Create initial admin user
npm run db:seed

# Start development server
npm run dev
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Create initial admin user

# Docker
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
npm run docker:logs     # View Docker logs

# Testing & Quality
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript checks
npm run test            # Run tests
npm run e2e             # Run end-to-end tests
```

## 🛡️ Security Features

### Authentication & Authorization
- Multi-factor authentication ready
- Role-based access control (RBAC)
- Session management with JWT
- Password strength requirements
- Account lockout after failed attempts

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

### Rate Limiting
- Login attempt limiting
- API rate limiting
- IP-based restrictions

### Audit Logging
- User login/logout events
- Administrative actions
- Data access logs
- Security events

## 📊 Database Schema

### Core Tables
- `User` - System users with roles
- `Session` - Active user sessions
- `Submission` - Public submissions
- `AuditLog` - System audit trail
- `UserAuditLog` - User-specific audit logs

### User Roles Hierarchy
```
ADMIN (Level 3)
├── Full system access
├── User management
└── System configuration

MANAGEMENT (Level 2)
├── User management
├── Audit logs
└── Reports

SUPPORT (Level 1)
├── View submissions
├── Basic operations
└── User support

VIEWER (Level 0)
└── Read-only access
```

## 🔒 Security Best Practices

### Password Requirements
- Minimum 12 characters
- Uppercase and lowercase letters
- Numbers and special characters
- No common passwords

### Session Security
- 8-hour session timeout
- Secure cookie settings
- Session invalidation on logout
- Concurrent session limits

### Data Protection
- Encrypted password storage (bcrypt)
- Secure database connections
- Input validation and sanitization
- SQL injection prevention

## 🚀 Production Deployment

### Docker Production Setup

1. **Environment Configuration**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="postgresql://user:pass@db:5432/election_commission"
   export NEXTAUTH_SECRET="your-production-secret"
   export NEXTAUTH_URL="https://your-domain.gov.bd"
   ```

2. **Build and Deploy**
   ```bash
   # Build Docker image
   docker build -t election-portal .

   # Run with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migration**
   ```bash
   # Run migrations in production
   docker exec election_app npm run db:migrate
   docker exec election_app npm run db:seed
   ```

### Security Checklist

- [ ] Change default admin password
- [ ] Configure HTTPS certificates
- [ ] Set up firewall rules
- [ ] Enable database SSL
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Test security headers
- [ ] Verify rate limiting
- [ ] Check audit logging

## 📝 Admin Panel Access

1. Navigate to `/login`
2. Use the admin credentials created during setup
3. Access different sections based on your role:
   - `/admin/dashboard` - Main dashboard
   - `/admin/users` - User management (Management+)
   - `/admin/submissions` - View submissions (Support+)
   - `/admin/audit` - Audit logs (Management+)
   - `/admin/settings` - System settings (Admin only)

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   docker ps
   
   # Check database logs
   docker logs election_postgres
   ```

2. **Authentication Issues**
   ```bash
   # Verify admin user exists
   npm run db:seed
   
   # Check session configuration
   # Verify NEXTAUTH_SECRET is set
   ```

3. **Permission Denied**
   - Check user role assignments
   - Verify route permissions
   - Check audit logs for access attempts

### Logs and Monitoring

```bash
# View application logs
docker logs election_app

# View database logs
docker logs election_postgres

# View all services
docker-compose logs -f
```

## 📞 Support

For technical support or security concerns:
- Email: admin@election-commission.gov.bd
- Internal: Contact system administrator
- Emergency: Follow incident response procedures

---

**⚠️ Security Notice**: This is a government system handling sensitive data. All access is logged and monitored. Unauthorized access is prohibited and may result in legal action.
