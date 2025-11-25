@echo off
echo Stopping all containers...
docker-compose --profile with-grafana down

echo Removing Grafana volume (this will reset Grafana data)...
docker volume rm prometheus_proj_grafana-data

echo Pulling latest images...
docker-compose --profile with-grafana pull

echo Starting containers with fresh Grafana...
docker-compose --profile with-grafana up -d

echo.
echo Done! Grafana should now start without errors.
echo Access Grafana at http://localhost:3000
echo Default credentials: admin/admin
