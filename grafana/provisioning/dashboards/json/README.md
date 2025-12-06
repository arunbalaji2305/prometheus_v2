# Multi-Platform Dashboard Configuration for Grafana

This folder contains pre-built Grafana dashboards for monitoring various systems and services:

## Available Dashboards

### System Dashboards
- **windows-system-metrics.json** - Windows system monitoring (CPU, Memory, Disk, Network)
- **linux-system-metrics.json** - Linux system monitoring (CPU, Memory, Disk, Network)

### Database Dashboards
- **mysql-metrics.json** - MySQL database monitoring (Connections, Queries, Slow Queries)
- **postgres-metrics.json** - PostgreSQL database monitoring (Connections, Transactions, Cache)
- **redis-metrics.json** - Redis cache monitoring (Memory, Keys, Hit Rate)
- **mongodb-metrics.json** - MongoDB monitoring (Operations, Connections, Memory)

### Web Server Dashboards
- **nginx-metrics.json** - Nginx web server monitoring (Requests, Connections, Status)

### Container Dashboards
- **docker-metrics.json** - Docker container monitoring (CPU, Memory, Network per container)

### Message Queue Dashboards
- **rabbitmq-metrics.json** - RabbitMQ monitoring (Queue depth, Messages, Consumers)
- **kafka-metrics.json** - Kafka monitoring (Consumer lag, Topics, Partitions)

## Usage

Dashboards are automatically provisioned when Grafana starts. Access them at:
http://localhost:3000/dashboards

Default credentials:
- Username: admin
- Password: admin

## Notes

- All dashboards use the default Prometheus datasource
- Dashboards will only show data if the corresponding exporter is running
- Update the datasource UID if needed (currently set to "PBFA97CFB590B2093")
