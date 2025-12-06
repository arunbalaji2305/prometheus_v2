# Multi-Platform Monitoring Setup Guide

This guide explains how to set up NL2PromQL to monitor **multiple platforms and services** (Windows, Linux, databases, web servers, containers, message queues) in a single unified system.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Platform-Specific Setup](#platform-specific-setup)
4. [Service Monitoring Setup](#service-monitoring-setup)
5. [Using NL2PromQL with Multiple Services](#using-nl2promql-with-multiple-services)
6. [Example Queries](#example-queries)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NL2PromQL System                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React) ←→ Backend (Node.js + Gemini AI)          │
│                            ↓                                  │
│                      Prometheus                               │
│                            ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Exporters (Metrics Collectors)          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • Windows Exporter (port 9182)                       │   │
│  │ • Node Exporter (port 9100) - Linux                  │   │
│  │ • MySQL Exporter (port 9104)                         │   │
│  │ • PostgreSQL Exporter (port 9187)                    │   │
│  │ • Redis Exporter (port 9121)                         │   │
│  │ • MongoDB Exporter (port 9216)                       │   │
│  │ • Nginx Exporter (port 9113)                         │   │
│  │ • cAdvisor (port 8080) - Docker                      │   │
│  │ • RabbitMQ Exporter (port 9419)                      │   │
│  │ • Kafka Exporter (port 9308)                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Docker Desktop** installed and running
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))
- **Internet connection**

### 2. Clone Repository

```bash
git clone https://github.com/arunbalaji2305/prometheus_v2.git
cd prometheus_v2
```

### 3. Create `.env` File

```bash
# Copy this content to .env file
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: For database monitoring
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password
MYSQL_HOST=host.docker.internal

POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_HOST=host.docker.internal
POSTGRES_DB=postgres

REDIS_HOST=host.docker.internal
REDIS_PASSWORD=

MONGODB_USER=admin
MONGODB_PASSWORD=your-mongodb-password
MONGODB_HOST=host.docker.internal

# Optional: For web server monitoring
NGINX_HOST=host.docker.internal
NGINX_PORT=80

# Optional: For message queue monitoring
RABBITMQ_HOST=host.docker.internal
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

KAFKA_HOST=host.docker.internal

# Optional: Email alerts
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 4. Start Core Services (Basic Monitoring)

```bash
# Start with just core services (Windows/Linux monitoring)
docker compose -f docker-compose-unified.yml up -d
```

This starts:
- ✅ Prometheus (port 9090)
- ✅ Backend API (port 4000)
- ✅ Frontend UI (port 80)

### 5. Access the Application

Open your browser: **http://localhost**

---

## 🖥️ Platform-Specific Setup

### Windows System Monitoring

**1. Install Windows Exporter:**

Download and install: [windows_exporter v0.31.3](https://github.com/prometheus-community/windows_exporter/releases)

```powershell
# Download installer
# Run the .msi installer
# Service will start automatically on port 9182
```

**2. Verify it's running:**

```powershell
curl http://localhost:9182/metrics
```

**3. Metrics you can query:**
- "Show CPU usage on Windows"
- "Windows memory available"
- "Disk usage on C: drive"
- "Network traffic by interface on Windows"

---

### Linux System Monitoring

**1. Install Node Exporter:**

```bash
# Download
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz

# Extract
tar xvfz node_exporter-1.7.0.linux-amd64.tar.gz

# Move to system
sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
```

**2. For Arch Linux (Easy Way):**

```bash
yay -S prometheus-node-exporter
sudo systemctl start prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
```

**3. Verify it's running:**

```bash
curl http://localhost:9100/metrics
```

**4. Metrics you can query:**
- "Show CPU usage on Linux"
- "Linux memory available"
- "Disk I/O on Linux"
- "Network traffic by device on Linux"
- "Linux load average"

---

## 🗄️ Service Monitoring Setup

### MySQL Monitoring

**1. Enable MySQL monitoring:**

```bash
# Start with MySQL profile
docker compose -f docker-compose-unified.yml --profile mysql up -d
```

**2. Configure MySQL user (on your MySQL server):**

```sql
CREATE USER 'exporter'@'%' IDENTIFIED BY 'password' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
FLUSH PRIVILEGES;
```

**3. Update `.env` with MySQL credentials**

**4. Queries you can run:**
- "MySQL active connections"
- "MySQL slow queries per second"
- "MySQL connection errors"
- "MySQL queries per second"

---

### PostgreSQL Monitoring

**1. Enable PostgreSQL monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile postgres up -d
```

**2. Configure PostgreSQL (on your PostgreSQL server):**

```sql
-- Create monitoring user
CREATE USER postgres_exporter WITH PASSWORD 'password';
GRANT pg_monitor TO postgres_exporter;
```

**3. Update `.env` with PostgreSQL credentials**

**4. Queries you can run:**
- "PostgreSQL active connections"
- "PostgreSQL database size"
- "PostgreSQL cache hit ratio"
- "PostgreSQL transaction rate"

---

### Redis Monitoring

**1. Enable Redis monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile redis up -d
```

**2. Update `.env` with Redis host/password**

**3. Queries you can run:**
- "Redis connected clients"
- "Redis memory usage"
- "Redis cache hit rate"
- "Redis evicted keys per second"
- "Redis keys in database"

---

### MongoDB Monitoring

**1. Enable MongoDB monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile mongodb up -d
```

**2. Update `.env` with MongoDB credentials**

**3. Queries you can run:**
- "MongoDB operations per second"
- "MongoDB active connections"
- "MongoDB document operations"
- "MongoDB resident memory"

---

### Nginx Monitoring

**1. Enable Nginx monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile nginx up -d
```

**2. Configure Nginx to expose metrics:**

Add to your Nginx config:

```nginx
server {
    listen 80;
    location /stub_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 172.0.0.0/8; # Docker network
        deny all;
    }
}
```

**3. Queries you can run:**
- "Nginx requests per second"
- "Nginx active connections"
- "Nginx waiting connections"

---

### Docker Container Monitoring

**1. Enable Docker monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile containers up -d
```

**2. Queries you can run:**
- "Docker container CPU usage"
- "Container memory usage by name"
- "Docker network traffic"
- "Container filesystem usage"

---

### RabbitMQ Monitoring

**1. Enable RabbitMQ monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile rabbitmq up -d
```

**2. Queries you can run:**
- "RabbitMQ queue depth"
- "RabbitMQ messages per second"
- "RabbitMQ consumers"

---

### Kafka Monitoring

**1. Enable Kafka monitoring:**

```bash
docker compose -f docker-compose-unified.yml --profile kafka up -d
```

**2. Queries you can run:**
- "Kafka consumer lag"
- "Kafka topic offset"

---

## 🎯 Using NL2PromQL with Multiple Services

### Enable All Services at Once

```bash
# Start everything!
docker compose -f docker-compose-unified.yml \
  --profile mysql \
  --profile postgres \
  --profile redis \
  --profile mongodb \
  --profile nginx \
  --profile containers \
  --profile rabbitmq \
  --profile kafka \
  --profile with-grafana \
  up -d
```

### Check What's Running

```bash
# View all containers
docker ps

# Check Prometheus targets
# Go to: http://localhost:9090/targets
```

---

## 💡 Example Queries

### System Queries

```
✅ "Show CPU usage"
✅ "Memory available on Linux"
✅ "Disk usage on Windows C: drive"
✅ "Network traffic by interface"
✅ "CPU usage by core"
✅ "Total disk I/O"
✅ "Linux load average"
```

### Database Queries

```
✅ "MySQL active connections"
✅ "PostgreSQL database size"
✅ "Redis memory usage"
✅ "MongoDB operations per second"
✅ "MySQL slow queries"
✅ "PostgreSQL cache hit ratio"
✅ "Redis cache hit rate"
```

### Web Server Queries

```
✅ "Nginx requests per second"
✅ "Nginx active connections"
✅ "Nginx waiting connections"
```

### Container Queries

```
✅ "Docker container CPU usage"
✅ "Container memory by name"
✅ "Docker network traffic"
```

### Message Queue Queries

```
✅ "RabbitMQ queue depth"
✅ "Kafka consumer lag"
✅ "RabbitMQ messages published per second"
```

### Cross-Platform Queries

```
✅ "CPU usage across all servers"
✅ "Total memory across all systems"
✅ "Show all service health"
✅ "Network traffic across all platforms"
```

---

## 🔧 Troubleshooting

### 1. Exporter Not Showing in Prometheus

**Check Prometheus targets:**
http://localhost:9090/targets

**Common issues:**
- Exporter not running (check `docker ps`)
- Wrong port or host in `.env`
- Firewall blocking connection

**Fix:**
```bash
# Restart services
docker compose -f docker-compose-unified.yml restart

# Check logs
docker logs prometheus
docker logs mysql-exporter
```

### 2. "NONE" Response from AI

**Causes:**
- Query not related to monitoring
- Metric doesn't exist
- Unclear query

**Fix:**
```
Instead of: "How are you?"
Try: "Show CPU usage"

Instead of: "Database"
Try: "MySQL active connections"
```

### 3. No Data in Grafana

**Check:**
1. Is the exporter running? (`docker ps`)
2. Is Prometheus scraping it? (http://localhost:9090/targets)
3. Are metrics available? (http://localhost:9104/metrics for MySQL)

**Fix:**
```bash
# Restart Grafana
docker restart grafana

# Check datasource in Grafana
# Go to: http://localhost:3000/datasources
```

### 4. Database Exporter Connection Failed

**Check credentials in `.env`:**
```bash
# Test MySQL connection
docker exec -it mysql-exporter sh
# Inside container:
wget -O- localhost:9104/metrics
```

**Update `.env` with correct credentials and restart:**
```bash
docker compose -f docker-compose-unified.yml restart mysql-exporter
```

---

## 📊 Monitoring Multiple Environments

### Scenario: Monitor Windows + Linux + Databases

```bash
# 1. Install Windows Exporter on Windows machine
# 2. Install Node Exporter on Linux machine
# 3. Start unified compose with profiles

docker compose -f docker-compose-unified.yml \
  --profile mysql \
  --profile redis \
  --profile with-grafana \
  up -d
```

**Now you can query:**
- "CPU usage on Windows"
- "CPU usage on Linux"
- "MySQL connections"
- "Redis memory usage"
- "Compare CPU across Windows and Linux"

---

## 🎯 Best Practices

1. **Start Small**: Begin with just system monitoring (Windows/Linux)
2. **Add Services Gradually**: Enable profiles one at a time
3. **Monitor What Matters**: Don't enable exporters you don't need
4. **Use Labels**: Prometheus labels help identify different servers
5. **Set Up Alerts**: Configure Grafana alerts for critical metrics
6. **Secure Your Setup**: Change default passwords, use HTTPS in production

---

## 📚 Additional Resources

- **Prometheus Documentation**: https://prometheus.io/docs/
- **Exporter List**: https://prometheus.io/docs/instrumenting/exporters/
- **PromQL Guide**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/

---

## 🚀 What's Next?

1. ✅ Set up monitoring for your platform (Windows/Linux)
2. ✅ Add database monitoring (MySQL, PostgreSQL, Redis)
3. ✅ Enable container monitoring (cAdvisor)
4. ✅ Configure Grafana dashboards
5. ✅ Set up email alerts
6. ✅ Create custom application metrics
7. ✅ Scale to multiple servers

---

**Enjoy unified monitoring across all your platforms and services!** 🎉

Need help? Check the troubleshooting section or open an issue on GitHub.
