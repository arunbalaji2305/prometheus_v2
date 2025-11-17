# Docker Setup Guide

This guide explains how to run the entire Natural Language to PromQL application stack using Docker and Docker Compose.

## Overview

The Docker setup includes:

- **Prometheus**: Metrics database (port 9090)
- **Backend**: Node.js API for NL→PromQL conversion (port 4000)
- **Frontend**: React web application (port 80)
- **Grafana** (optional): Advanced visualization (port 3000)

All services are networked together and can communicate seamlessly.

## Prerequisites

### Windows

1. **Docker Desktop for Windows**
   - Download from https://www.docker.com/products/docker-desktop
   - Ensure WSL 2 backend is enabled (for better performance)
   - Minimum 4GB RAM allocated to Docker

2. **Windows Exporter** (running on host)
   - Download from https://github.com/prometheus-community/windows_exporter
   - Run on port 9182 (default)
   - This runs on your Windows host, not in Docker

### Verify Installation

```powershell
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone and Configure

```powershell
cd C:\Users\arunb\Desktop\Prometheus_proj

# Copy environment file
cp .env.example .env
```

### 2. Edit `.env`

Add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:4000
```

Optional: Enable Grafana integration

```env
VITE_GRAFANA_BASE_URL=http://localhost:3000
```

### 3. Start Services

**Option A: Without Grafana** (faster, minimal)

```powershell
docker-compose up -d
```

**Option B: With Grafana** (full stack)

```powershell
docker-compose --profile with-grafana up -d
```

### 4. Verify Services

Check that all containers are running:

```powershell
docker-compose ps
```

You should see:
- `prometheus` - Up and healthy
- `nl2promql-backend` - Up and healthy
- `nl2promql-frontend` - Up and healthy
- `grafana` (if using profile) - Up

### 5. Access Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost | - |
| Backend API | http://localhost:4000 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin / admin |

## Using Makefile Commands

For convenience, use the provided Makefile:

```powershell
# View all available commands
make help

# Install dependencies (for local development)
make install

# Build Docker images
make build

# Start services (without Grafana)
make up

# Start services (with Grafana)
make up-grafana

# View logs
make logs

# Stop services
make down

# Clean up everything (containers, volumes, images)
make clean
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                    │
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │  Prometheus  │◄─────│   Backend    │            │
│  │   :9090      │      │    :4000     │◄─────┐     │
│  └──────▲───────┘      └──────▲───────┘      │     │
│         │                     │               │     │
│         │ scrape              │ API calls     │     │
│         │                     │               │     │
│  ┌──────┴───────┐      ┌──────┴───────┐      │     │
│  │   Grafana    │      │   Frontend   │──────┘     │
│  │   :3000      │      │     :80      │            │
│  │  (optional)  │      └──────────────┘            │
│  └──────────────┘                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
         │ scrape
         │
┌────────▼──────────┐
│  Windows Host     │
│  Windows Exporter │
│     :9182         │
└───────────────────┘
```

## Configuration Details

### Backend Environment Variables

Set in `docker-compose.yml` or `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | (required) |
| `PROMETHEUS_URL` | Prometheus endpoint | `http://prometheus:9090` |
| `PORT` | Backend port | `4000` |
| `NODE_ENV` | Node environment | `production` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost` |

### Frontend Build Arguments

Set in `docker-compose.yml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000` |
| `VITE_GRAFANA_BASE_URL` | Grafana URL (optional) | - |

### Prometheus Configuration

Edit `prometheus/prometheus.yml` to customize:

```yaml
scrape_configs:
  - job_name: 'windows'
    static_configs:
      - targets: ['host.docker.internal:9182']
```

**Important**: `host.docker.internal` allows Docker containers to access the Windows host. This is how Prometheus scrapes Windows Exporter running on your machine.

## Volumes and Data Persistence

Docker Compose creates named volumes for persistent data:

- `prometheus-data`: Prometheus time-series database
- `grafana-data`: Grafana dashboards and settings

These volumes persist even when containers are stopped.

### Backup Volumes

```powershell
# List volumes
docker volume ls

# Inspect a volume
docker volume inspect prometheus_proj_prometheus-data

# Backup (export to tar)
docker run --rm -v prometheus_proj_prometheus-data:/data -v ${PWD}:/backup alpine tar czf /backup/prometheus-backup.tar.gz -C /data .
```

### Restore Volumes

```powershell
docker run --rm -v prometheus_proj_prometheus-data:/data -v ${PWD}:/backup alpine tar xzf /backup/prometheus-backup.tar.gz -C /data
```

## Health Checks

Each service has health checks configured:

### Check Service Health

```powershell
# View health status
docker-compose ps

# Check specific service
docker inspect nl2promql-backend --format='{{.State.Health.Status}}'
```

### Manual Health Check URLs

- Backend: `http://localhost:4000/api/health`
- Prometheus: `http://localhost:9090/-/healthy`
- Frontend: `http://localhost/`

## Logs and Debugging

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Access Container Shell

```powershell
# Backend
docker exec -it nl2promql-backend sh

# Prometheus
docker exec -it prometheus sh

# Frontend (nginx)
docker exec -it nl2promql-frontend sh
```

### Debug Network

```powershell
# Inspect network
docker network inspect prometheus_proj_monitoring

# Test connectivity from backend to Prometheus
docker exec nl2promql-backend wget -qO- http://prometheus:9090/-/healthy
```

## Updating and Rebuilding

### Update Code and Rebuild

```powershell
# Pull latest code changes (if using git)
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### Force Rebuild (no cache)

```powershell
docker-compose build --no-cache
```

### Update Single Service

```powershell
# Rebuild and restart only backend
docker-compose up -d --build backend
```

## Scaling and Performance

### Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Monitor Resource Usage

```powershell
docker stats
```

## Production Considerations

### Security

1. **Change default passwords**:
   - Grafana: Set strong admin password
   - Add authentication to Prometheus if exposed

2. **Use secrets management**:
   ```yaml
   secrets:
     gemini_api_key:
       file: ./secrets/gemini_key.txt
   ```

3. **Enable HTTPS**:
   - Use a reverse proxy (nginx, traefik) with SSL certificates
   - Configure Let's Encrypt for automatic SSL

### High Availability

For production:

1. Use external Prometheus with persistent storage
2. Run multiple backend replicas
3. Use a load balancer for frontend
4. Set up monitoring and alerting

## Troubleshooting

### Container Keeps Restarting

```powershell
# Check logs
docker-compose logs backend

# Check health
docker inspect nl2promql-backend
```

Common causes:
- Missing environment variables (GEMINI_API_KEY)
- Port conflicts
- Insufficient memory

### Cannot Connect to Prometheus from Backend

**Issue**: Backend can't reach Prometheus

**Solutions**:
1. Ensure both are on same Docker network
2. Use service name `prometheus`, not `localhost`
3. Check Prometheus is healthy: `docker-compose ps`

### Windows Exporter Not Scraped

**Issue**: Prometheus can't scrape Windows Exporter on host

**Solutions**:
1. Ensure Windows Exporter is running: `http://localhost:9182/metrics`
2. Check firewall allows Docker to access port 9182
3. Verify `host.docker.internal` resolves in container:
   ```powershell
   docker exec prometheus ping host.docker.internal
   ```

### Frontend Shows "Cannot connect to backend"

**Causes**:
- Backend not running or unhealthy
- Wrong `VITE_API_BASE_URL` (must be accessible from browser, not container)
- CORS not configured

**Fix**:
```env
VITE_API_BASE_URL=http://localhost:4000  # Not http://backend:4000
```

### Permission Denied Errors

On Windows with WSL2 backend:

```powershell
# Reset Docker Desktop
# Settings → Troubleshoot → Reset to factory defaults
```

## Stopping and Cleanup

### Stop Services (keep data)

```powershell
docker-compose down
```

### Stop and Remove Volumes (delete data)

```powershell
docker-compose down -v
```

### Remove All Images

```powershell
docker-compose down --rmi all
```

### Complete Cleanup

```powershell
# Stop containers, remove volumes, remove images
make clean

# Or manually:
docker-compose down -v --rmi all
docker system prune -a
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Push to registry
        run: docker-compose push
```

## Summary

Docker Compose provides a complete, reproducible environment for the Natural Language to PromQL project. It handles:

- ✅ Service orchestration
- ✅ Networking between services
- ✅ Data persistence
- ✅ Health monitoring
- ✅ Easy updates and rollbacks

For development, you can still run services locally. For production or testing the full stack, Docker Compose is the recommended approach.

