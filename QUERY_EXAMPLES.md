# NL2PromQL Query Examples - Multi-Platform Edition

Quick reference for natural language queries across all supported platforms and services.

---

## 🖥️ System Monitoring

### Windows
```
"Show CPU usage on Windows"
"Windows memory available"
"Disk usage on C: drive"
"Network traffic on Windows by interface"
"CPU by core on Windows"
"Disk I/O on C:"
```

### Linux
```
"Show CPU usage on Linux"
"Linux memory available"
"Disk usage on root partition"
"Network traffic on Linux by device"
"CPU by core on Linux"
"Linux load average"
"Filesystem usage on /home"
```

### Cross-Platform
```
"CPU usage across all servers"
"Total memory across all systems"
"Compare CPU between Windows and Linux"
"Show all system metrics"
```

---

## 🗄️ Database Monitoring

### MySQL
```
"MySQL active connections"
"MySQL slow queries per second"
"MySQL query rate"
"MySQL connection errors"
"MySQL table locks"
"Is MySQL running"
"MySQL buffer pool size"
```

### PostgreSQL
```
"PostgreSQL active connections"
"PostgreSQL database size"
"PostgreSQL cache hit ratio"
"PostgreSQL transaction rate"
"PostgreSQL deadlocks"
"Is PostgreSQL up"
```

### Redis
```
"Redis connected clients"
"Redis memory usage"
"Redis cache hit rate"
"Redis evicted keys per second"
"Redis keys in database"
"Redis memory percentage"
"Is Redis running"
```

### MongoDB
```
"MongoDB operations per second"
"MongoDB active connections"
"MongoDB document operations"
"MongoDB resident memory"
"Is MongoDB up"
```

---

## 🌐 Web Server Monitoring

### Nginx
```
"Nginx requests per second"
"Nginx active connections"
"Nginx waiting connections"
"Nginx reading connections"
"Nginx writing connections"
"Is Nginx running"
```

---

## 🐳 Container Monitoring

### Docker (cAdvisor)
```
"Docker container CPU usage"
"Container memory usage by name"
"Docker network traffic"
"Container filesystem usage"
"Show all containers"
"Container CPU by name"
```

---

## 📨 Message Queue Monitoring

### RabbitMQ
```
"RabbitMQ queue depth"
"RabbitMQ messages per second"
"RabbitMQ consumers"
"RabbitMQ messages published"
"RabbitMQ messages delivered"
```

### Kafka
```
"Kafka consumer lag"
"Kafka topic offset"
```

---

## 📊 Advanced Queries

### Aggregations
```
"Average CPU across all cores"
"Maximum memory usage"
"Total network traffic"
"Sum of all disk I/O"
"Minimum available memory"
```

### Time-Based
```
"CPU usage in last 5 minutes"
"Network traffic in last hour"
"Disk I/O over last 30 minutes"
"Memory usage in last 2 hours"
```

### Comparisons
```
"CPU above 80 percent"
"Memory usage over 8GB"
"Network traffic exceeding 1MB/s"
"Slow queries more than 10 per minute"
```

### Health Checks
```
"Is MySQL running"
"Check all services"
"Show service health"
"Redis server status"
```

---

## 🎯 Query Tips

### Be Specific
❌ "show stats"
✅ "show CPU usage"

❌ "database"
✅ "MySQL active connections"

### Use Time Ranges
✅ "CPU usage in last 15 minutes"
✅ "Network traffic over last hour"
✅ "Disk I/O for last 30 minutes"

### Specify Platform (if needed)
✅ "CPU on Windows"
✅ "Memory on Linux"
✅ "Network traffic on Windows by interface"

### Group By Labels
✅ "CPU by core"
✅ "Network by interface"
✅ "Disk usage by volume"
✅ "Container CPU by name"

---

## 📚 Common Patterns

### System Health Overview
```
"CPU usage"
"Memory usage"
"Disk usage"
"Network traffic"
```

### Database Health
```
"MySQL connections"
"Redis memory"
"PostgreSQL transactions"
"MongoDB operations"
```

### Performance Metrics
```
"Nginx requests per second"
"MySQL query rate"
"Redis cache hit rate"
"PostgreSQL cache hit ratio"
```

### Capacity Planning
```
"Memory available"
"Disk free space"
"Maximum CPU usage"
"Peak network traffic"
```

---

## 🚨 Alert-Worthy Queries

```
"CPU above 90 percent"
"Memory below 1GB"
"Disk usage above 85 percent"
"MySQL connections over 100"
"Redis memory above 4GB"
"Nginx error rate"
```

---

## 🔍 Debugging Queries

```
"Show all metrics"
"What exporters are up"
"Check service status"
"Show all targets"
"List all jobs"
```

---

## 💡 Pro Tips

1. **Start Simple**: Begin with basic queries like "show CPU"
2. **Add Details**: Then specify platform, time range, grouping
3. **Combine Metrics**: Use "and" or "total" for combined queries
4. **Check Status**: Use "is X running" for health checks
5. **Use Comparisons**: Add thresholds like "above 80%"

---

## 📖 Need More Help?

- **Full Setup Guide**: See `MULTI_PLATFORM_SETUP.md`
- **PromQL Reference**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Metric Explorer**: http://localhost:9090/graph

---

**Happy Monitoring!** 🎉
