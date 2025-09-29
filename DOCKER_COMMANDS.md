# Docker Commands Reference

This document contains all the Docker commands used for complete cleanup and fresh rebuild of the Election Commission Portal application.

## 🧹 Complete Docker Cleanup Commands

### 1. Stop All Running Containers
```bash
docker-compose down
```

### 2. Remove All Containers
```bash
docker container prune -f
```

### 3. Remove All Images
```bash
docker image prune -a -f
```

### 4. Remove All Volumes
```bash
docker volume prune -f
```

### 5. Remove All Networks
```bash
docker network prune -f
```

### 6. Complete System Cleanup (Frees Maximum Space)
```bash
docker system prune -a -f --volumes
```

## 🚀 Fresh Application Rebuild Commands

### 1. Build and Start All Services
```bash
docker-compose up --build -d
```

### 2. Check Container Status
```bash
docker-compose ps
```

### 3. View Application Logs
```bash
docker-compose logs app --tail=10
```

### 4. View All Logs
```bash
docker-compose logs --tail=20
```

## 🗄️ Database Setup Commands

### 1. Run Database Migrations
```bash
docker-compose exec app npx prisma db push
```

### 2. Create Admin Users
```bash
docker-compose exec app node scripts/create-admin.js
```

### 3. Restart Application After Database Setup
```bash
docker-compose restart app
```

## 🔧 Container Management Commands

### 1. Restart All Services
```bash
docker-compose restart
```

### 2. Restart Specific Service
```bash
docker-compose restart app
```

### 3. Stop All Services
```bash
docker-compose down
```

### 4. View Real-time Logs
```bash
docker-compose logs app -f
```

### 5. Execute Commands in Container
```bash
docker-compose exec app [command]
```

## 🔍 Monitoring and Debugging Commands

### 1. Check Container Health
```bash
docker-compose ps
```

### 2. View Container Logs
```bash
docker-compose logs [service-name]
```

### 3. Check Application Status
```bash
curl -I http://localhost:3000/
```

### 4. Test Login Page
```bash
curl -I http://localhost:3000/en/login
```

### 5. Check Database Connection
```bash
docker-compose exec app npx prisma db push
```

## 🛠️ Development Commands

### 1. Rebuild Specific Service
```bash
docker-compose up --build [service-name]
```

### 2. View Environment Variables
```bash
docker-compose exec app env | grep DATABASE_URL
```

### 3. Access Container Shell
```bash
docker-compose exec app sh
```

### 4. Check Prisma Schema
```bash
docker-compose exec app npx prisma validate
```

## 📊 Space Management Commands

### 1. Check Docker Disk Usage
```bash
docker system df
```

### 2. Remove Unused Build Cache
```bash
docker builder prune -f
```

### 3. Remove Specific Images
```bash
docker rmi [image-id]
```

### 4. Remove Specific Volumes
```bash
docker volume rm [volume-name]
```

## 🔐 User Management Commands

### 1. Create Admin Users
```bash
docker-compose exec app node scripts/create-admin.js
```

### 2. View User Credentials
```bash
cat user-credentials.json
```

### 3. Test Authentication
```bash
docker-compose exec app node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
// Test authentication logic
"
```

## 🌐 Service URLs

- **Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/en/login
- **pgAdmin**: http://localhost:5050
- **Database**: localhost:5432

## 🔑 Default Credentials

### Admin User
- **Email**: `admin@neic-bd.org`
- **Password**: `9pB5hUuv1Pnm218!`

### Management User
- **Email**: `manager@neic-bd.org`
- **Password**: `!Ju$V7e8iIsq5taJ`

### Support User
- **Email**: `support@neic-bd.org`
- **Password**: `Gn$!l8FLsvf@LdBg`

## ⚠️ Important Notes

1. **Always backup data** before running cleanup commands
2. **Change default passwords** after first login
3. **Keep credentials secure** and delete `user-credentials.json` after noting them
4. **Monitor disk space** when running multiple Docker projects
5. **Use `-f` flag** for non-interactive cleanup operations

## 🚨 Emergency Commands

### Complete Reset (Nuclear Option)
```bash
# Stop everything
docker-compose down

# Remove everything
docker system prune -a -f --volumes

# Rebuild from scratch
docker-compose up --build -d

# Setup database
docker-compose exec app npx prisma db push
docker-compose exec app node scripts/create-admin.js
docker-compose restart app
```

### Quick Restart
```bash
docker-compose restart
```

### View All Logs
```bash
docker-compose logs --tail=50
```

---

**Generated on**: $(date)  
**Total Space Freed**: 24.44GB  
**Status**: ✅ All services running successfully
