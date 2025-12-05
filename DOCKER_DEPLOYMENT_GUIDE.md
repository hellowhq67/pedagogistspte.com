# Docker Deployment Guide for PTE Academic Platform

## 🐳 Docker Files Overview

This project includes complete Docker support for both local development and production deployment.

### Files Created
- **`Dockerfile`** - Multi-stage production build
- **`docker-compose.yml`** - Complete stack with PostgreSQL, Redis, and Adminer
- **`.dockerignore`** - Optimized build context

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed (Windows/Mac/Linux)
- Docker Compose v2.0+

### 1. Local Development Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/hellowhq67/pedagogistspte.com.git
cd pedagogistspte.com

# Create .env file from template
cp .env.example .env

# Edit .env and add your API keys:
# - OPENAI_API_KEY
# - GOOGLE_AI_API_KEY
# - ASSEMBLYAI_API_KEY
# - BLOB_READ_WRITE_TOKEN
# - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)

# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app pnpm db:migrate

# Seed database (optional)
docker-compose exec app pnpm db:seed:all
```

### 2. Access the Application

- **Web App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Database Admin (Adminer)**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: pte_user
  - Password: pte_password
  - Database: pte_academic

### 3. Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## 📦 Docker Services

### Main Application (`app`)
- **Image**: Built from Dockerfile (multi-stage)
- **Port**: 3000
- **Health Check**: /api/health endpoint
- **Depends on**: PostgreSQL database

### PostgreSQL Database (`postgres`)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Data**: Persisted in `postgres_data` volume
- **Credentials**: Set in docker-compose.yml

### Redis Cache (`redis`)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Data**: Persisted in `redis_data` volume
- **Usage**: Optional caching and session storage

### Adminer (`adminer`)
- **Image**: adminer:latest
- **Port**: 8080
- **Purpose**: Database management UI

## 🏗️ Dockerfile Stages

### Stage 1: Dependencies
- Base: node:18-alpine
- Installs pnpm and project dependencies
- Uses frozen lockfile for reproducibility

### Stage 2: Builder
- Copies dependencies from stage 1
- Builds Next.js application
- Optimizes for production

### Stage 3: Runner
- Minimal runtime image
- Non-root user for security
- Only includes built artifacts
- Optimized for size and performance

## 🔧 Environment Variables

### Required Variables

```bash
# Database (auto-configured in docker-compose)
POSTGRES_URL=postgresql://pte_user:pte_password@postgres:5432/pte_academic
DATABASE_URL=postgresql://pte_user:pte_password@postgres:5432/pte_academic

# Authentication (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# AI Services (REQUIRED - set in .env)
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
ASSEMBLYAI_API_KEY=your-assemblyai-key

# File Storage (REQUIRED - set in .env)
BLOB_READ_WRITE_TOKEN=vercel_blob_your-token
```

### Optional Variables

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email
RESEND_API_KEY=re_your-resend-key
EMAIL_FROM=noreply@your-domain.com

# Payment
POLAR_ACCESS_TOKEN=your-polar-token
STRIPE_SECRET_KEY=sk_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## 🛠️ Common Docker Commands

### Development

```bash
# Build without cache
docker-compose build --no-cache

# Restart a specific service
docker-compose restart app

# View logs for specific service
docker-compose logs -f postgres

# Execute command in running container
docker-compose exec app sh

# Run database migrations
docker-compose exec app pnpm db:migrate

# Open Drizzle Studio
docker-compose exec app pnpm db:studio
```

### Production Build

```bash
# Build production image
docker build -t pte-academic:latest .

# Run production container
docker run -p 3000:3000 \
  -e POSTGRES_URL="your-production-db-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e OPENAI_API_KEY="your-key" \
  pte-academic:latest
```

### Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove all unused data
docker system prune -a
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process or change port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Build Fails

```bash
# Clean everything and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### App Won't Start

```bash
# Check app logs
docker-compose logs app

# Check health status
docker-compose ps

# Restart app
docker-compose restart app
```

## 📊 Performance Optimization

### Build Optimization
- Multi-stage build reduces final image size by ~70%
- Layer caching speeds up subsequent builds
- Only production dependencies in final image

### Runtime Optimization
- Non-root user for security
- Health checks ensure service availability
- Persistent volumes for data
- Alpine Linux for minimal footprint

## 🚢 Deployment to Production

### Using Docker Hub

```bash
# Tag image
docker tag pte-academic:latest username/pte-academic:latest

# Push to Docker Hub
docker push username/pte-academic:latest

# Pull and run on production server
docker pull username/pte-academic:latest
docker run -d -p 3000:3000 \
  -e POSTGRES_URL="production-db-url" \
  username/pte-academic:latest
```

### Using Railway with Dockerfile

Railway can automatically detect and build your Dockerfile:

1. **Create `railway.json`** (already exists)
2. **Set builder to DOCKERFILE**:
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     }
   }
   ```
3. **Deploy**: Railway will use your Dockerfile

### Using Docker Compose in Production

```bash
# Copy docker-compose.yml to production server
# Create production .env file
# Start services
docker-compose -f docker-compose.yml up -d

# Run migrations
docker-compose exec app pnpm db:migrate
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use secrets management** - For production, use Docker secrets or environment injection
3. **Non-root user** - Dockerfile runs as `nextjs` user (UID 1001)
4. **Network isolation** - Services communicate via internal Docker network
5. **Resource limits** - Set CPU and memory limits in production
6. **Health checks** - Ensure services are running correctly

## 📚 Additional Resources

- **Docker Docs**: https://docs.docker.com
- **Docker Compose Docs**: https://docs.docker.com/compose
- **Next.js Docker**: https://nextjs.org/docs/deployment#docker-image
- **PostgreSQL Docker**: https://hub.docker.com/_/postgres
- **Redis Docker**: https://hub.docker.com/_/redis

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables are set
3. Ensure ports are not in use
4. Check Docker daemon is running

---

**Created**: December 5, 2025
**Status**: ✅ Ready for local development and production deployment
