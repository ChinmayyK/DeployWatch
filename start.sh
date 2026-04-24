#!/bin/bash

# Configuration
FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"
LOG_DIR="./logs"

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

function start_app() {
    echo "🚀 Starting DeployWatch via Docker Compose..."
    docker compose up -d --build

    echo ""
    echo "✅ Services are starting up in containers."
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend:  http://localhost:4000"
    echo ""
    echo "💡 You can view logs by running: docker compose logs -f"
}

function stop_app() {
    echo "🛑 Stopping DeployWatch containers..."
    docker compose down
    echo "✅ All services stopped."
}

case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        stop_app
        sleep 2
        start_app
        ;;
    logs)
        docker compose logs -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs}"
        exit 1
esac
