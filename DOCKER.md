# Docker Setup Guide

This guide explains how to run the Money Tracker API using Docker in both development and production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Docker Commands](#docker-commands)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## 🔧 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Installation

#### macOS
```bash
brew install docker docker-compose
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

#### Windows
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd money-tracker-api
cp env.example .env
```

### 2. Start Development Environment
```bash
# Using Docker Compose (recommended)
npm run docker:compose:up

# Or using Docker directly
npm run docker:build:dev
npm run docker:run:dev
```

### 3. Verify Installation
```bash
curl http://localhost:3000/health
```

## 🛠 Development Environment

### Features
- **Hot Reload**: Code changes are automatically reflected
- **Volume Mounting**: Source code is mounted for live editing
- **Debug Support**: Full debugging capabilities
- **Development Dependencies**: All dev tools included

### Commands

#### Start Development Environment
```bash
# Start with logs
npm run docker:compose:up

# Start in background
docker-compose up -d

# Build and start
npm run docker:compose:up:build
```

#### Stop Development Environment
```bash
npm run docker:compose:down
```

#### View Logs
```bash
npm run docker:logs
```

#### Access Container Shell
```bash
npm run docker:shell
```

### Development Configuration

The development setup includes:
- **Node.js 18 Alpine**: Lightweight base image
- **Volume Mounting**: `/usr/src/app` for live code editing
- **Port Mapping**: `3000:3000`
- **Environment Variables**: Loaded from `.env` file
- **Health Checks**: Automatic health monitoring

## 🏭 Production Environment

### Features
- **Multi-stage Build**: Optimized for production
- **Security Hardening**: Non-root user, read-only filesystem
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **Database Integration**: PostgreSQL with persistence
- **Redis Caching**: In-memory caching layer
- **Resource Limits**: CPU and memory constraints
- **Health Checks**: Comprehensive monitoring

### Commands

#### Start Production Environment
```bash
# Create production environment file
cp env.example .env.production

# Start production stack
npm run docker:compose:prod:up

# Build and start production
npm run docker:compose:prod:build
```

#### Stop Production Environment
```bash
npm run docker:compose:prod:down
```

#### View Production Logs
```bash
npm run docker:logs:prod
```

#### Access Production Container
```bash
npm run docker:shell:prod
```

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Node.js API   │    │   PostgreSQL    │
│  (Port 80/443)  │───▶│   (Port 3000)   │───▶│   (Port 5432)   │
│  Load Balancer  │    │   Application   │    │    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │              ┌─────────────────┐
         │                       └──────────────│      Redis      │
         │                                      │   (Port 6379)   │
         │                                      │     Cache       │
         │                                      └─────────────────┘
         │
    ┌─────────────────┐
    │   SSL/TLS       │
    │  Certificates   │
    │   (Optional)    │
    └─────────────────┘
```

## 🐳 Docker Commands

### Building Images

```bash
# Build all targets
npm run docker:build

# Build development image
npm run docker:build:dev

# Build production image
npm run docker:build:prod

# Build with custom tag
docker build -t money-tracker-api:custom .
```

### Running Containers

```bash
# Run development container
npm run docker:run:dev

# Run production container
npm run docker:run

# Run with custom environment file
docker run -p 3000:3000 --env-file .env.custom money-tracker-api

# Run with port mapping
docker run -p 8080:3000 money-tracker-api
```

### Container Management

```bash
# List running containers
docker ps

# Stop all containers
docker stop $(docker ps -q)

# Remove containers
docker rm $(docker ps -aq)

# View container logs
docker logs money-tracker-api-dev

# Execute commands in container
docker exec -it money-tracker-api-dev npm test
```

### Cleanup

```bash
# Clean up everything
npm run docker:clean

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

## 🌍 Environment Variables

### Required Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### Optional Variables

```bash
# Database (Production)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=money_tracker
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Redis (Production)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security
JWT_SECRET=your_very_long_jwt_secret
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Files

- **`.env`**: Development environment
- **`.env.production`**: Production environment
- **`env.example`**: Template with all available variables

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker run -p 3001:3000 money-tracker-api
```

#### Container Won't Start
```bash
# Check container logs
docker logs money-tracker-api-dev

# Check container health
docker inspect money-tracker-api-dev
```

#### Out of Disk Space
```bash
# Clean up Docker resources
npm run docker:clean

# Check disk usage
docker system df
```

#### Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Run as specific user
docker run --user $(id -u):$(id -g) money-tracker-api
```

### Debug Mode

```bash
# Run container in interactive mode
docker run -it money-tracker-api /bin/sh

# Run with debug output
DEBUG=* docker-compose up
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check container resource limits
docker inspect money-tracker-api-prod | grep -A 10 "Resources"
```

## 🔒 Security Considerations

### Production Security

1. **Non-root User**: Containers run as user ID 1001
2. **Read-only Filesystem**: Prevents runtime modifications
3. **Resource Limits**: CPU and memory constraints
4. **Security Options**: `no-new-privileges` enabled
5. **Network Isolation**: Custom Docker networks
6. **Secret Management**: Environment variables for sensitive data

### SSL/TLS Configuration

For production HTTPS:

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt
   certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```

2. **Configure Nginx**:
   ```bash
   # Uncomment SSL configuration in nginx.conf
   ssl_certificate /etc/nginx/ssl/cert.pem;
   ssl_certificate_key /etc/nginx/ssl/key.pem;
   ```

3. **Mount SSL Files**:
   ```bash
   # Add to docker-compose.prod.yml
   volumes:
     - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro
   ```

### Security Updates

```bash
# Update base images
docker pull node:18-alpine
docker pull nginx:1.24-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine

# Rebuild with updated images
npm run docker:compose:prod:build
```

## 📊 Monitoring

### Health Checks

All containers include health checks:
- **API Container**: `GET /health`
- **Database**: Connection test
- **Redis**: Ping command

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app

# View logs with timestamps
docker-compose logs -f -t
```

### Metrics

```bash
# Container resource usage
docker stats

# System resource usage
docker system df
```

## 🚀 Deployment

### Development Deployment

```bash
# Start development environment
npm run docker:compose:up:build
```

### Production Deployment

```bash
# Create production environment
cp env.example .env.production
# Edit .env.production with production values

# Deploy to production
npm run docker:compose:prod:build

# Verify deployment
curl -k https://localhost/health
```

### CI/CD Integration

```bash
# Build and test
docker build --target development -t money-tracker-api:test .
docker run --rm money-tracker-api:test npm test

# Build production image
docker build --target production -t money-tracker-api:prod .

# Push to registry
docker tag money-tracker-api:prod registry.example.com/money-tracker-api:latest
docker push registry.example.com/money-tracker-api:latest
```

---

**Need help?** Check the [main README](README.md) or open an issue on GitHub. 