---
title: demo/nginx-balancer-chat/readme
group: demo/nginx-balancer-chat
---

# Nginx Balancer Chat

Production-ready system with nginx load balancing, PM2 process management and Docker containerization.

## Purpose

Demonstrates capabilities:
- Production deployment architecture
- Load balancing with nginx
- Process management with PM2  
- Docker containerization
- High availability setup

## Key Features

- **Nginx Load Balancer**: Load distribution between instances
- **PM2 Process Management**: Managing multiple processes
- **Docker Support**: Containerization for deployment
- **Health Checks**: Server status monitoring
- **Auto-scaling**: Automatic scaling

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Load Balancer**: Nginx
- **Process Manager**: PM2
- **Containerization**: Docker & Docker Compose

## Project Structure

```
├── config/
│   ├── nginx.conf          # Nginx configuration
│   └── ecosystem.config.cjs # PM2 configuration
├── docker/
│   └── bun/               # Docker images
├── docker-compose.yaml    # Docker Compose
├── src/
│   ├── client.ts         # WebSocket client
│   ├── server.ts         # WebSocket server
│   └── lib/
│       └── swarm.ts      # Swarm configuration
└── logs/                 # Nginx and PM2 logs
```

## Installation and Setup

### Local Development
```bash
# Install dependencies
bun install

# Start with PM2
pm2 start config/ecosystem.config.cjs

# Start nginx
nginx -c $(pwd)/config/nginx.conf
```

### Docker Deployment
```bash
# Build and start
docker-compose up --build

# Scaling
docker-compose up --scale app=5
```

## Configuration

### Environment Variables
```env
NODE_ENV=production
WS_PORT=8080
NGINX_PORT=80
PM2_INSTANCES=5
OPENAI_API_KEY=your_openai_api_key
```

### Nginx Configuration
```nginx
upstream app_servers {
    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
    server localhost:8084;
    server localhost:8085;
}
```

## Production Features

- **High Availability**: Multiple instances for reliability
- **Load Distribution**: Even request distribution
- **Health Monitoring**: Automatic exclusion of non-working servers
- **Graceful Shutdown**: Proper process termination
- **Log Management**: Centralized logs

## Monitoring

```bash
# PM2 monitoring
pm2 monit

# Nginx status
curl http://localhost/nginx_status

# Docker logs
docker-compose logs -f
```

## Use Cases

Critical for:
- Production deployments
- High-traffic applications
- Enterprise solutions
- SaaS platforms
- Mission-critical systems

## Scaling Strategy

1. **Horizontal Scaling**: Adding new instances
2. **Vertical Scaling**: Increasing resources of existing ones
3. **Auto-scaling**: Automatic scaling based on load
4. **Geographic Distribution**: Deployment in different regions