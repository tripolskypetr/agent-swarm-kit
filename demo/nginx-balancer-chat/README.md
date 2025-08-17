---
title: demo/nginx-balancer-chat/readme
group: demo/nginx-balancer-chat
---

# Nginx Balancer Chat

Production-ready система с nginx load balancing, PM2 process management и Docker контейнеризацией.

## Назначение

Демонстрирует возможности:
- Production deployment архитектуры
- Load balancing с nginx
- Process management с PM2  
- Docker контейнеризации
- High availability setup

## Ключевые возможности

- **Nginx Load Balancer**: Распределение нагрузки между инстансами
- **PM2 Process Management**: Управление множественными процессами
- **Docker Support**: Контейнеризация для развертывания
- **Health Checks**: Мониторинг состояния серверов
- **Auto-scaling**: Автоматическое масштабирование

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Load Balancer**: Nginx
- **Process Manager**: PM2
- **Containerization**: Docker & Docker Compose

## Структура проекта

```
├── config/
│   ├── nginx.conf          # Nginx конфигурация
│   └── ecosystem.config.cjs # PM2 конфигурация
├── docker/
│   └── bun/               # Docker образы
├── docker-compose.yaml    # Docker Compose
├── src/
│   ├── client.ts         # WebSocket клиент
│   ├── server.ts         # WebSocket сервер
│   └── lib/
│       └── swarm.ts      # Swarm конфигурация
└── logs/                 # Логи nginx и PM2
```

## Установка и запуск

### Local Development
```bash
# Установка зависимостей
bun install

# Запуск с PM2
pm2 start config/ecosystem.config.cjs

# Запуск nginx
nginx -c $(pwd)/config/nginx.conf
```

### Docker Deployment
```bash
# Сборка и запуск
docker-compose up --build

# Масштабирование
docker-compose up --scale app=5
```

## Конфигурация

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

- **High Availability**: Несколько инстансов для надежности
- **Load Distribution**: Равномерное распределение запросов
- **Health Monitoring**: Автоматическое исключение неработающих серверов
- **Graceful Shutdown**: Корректное завершение процессов
- **Log Management**: Централизованные логи

## Monitoring

```bash
# PM2 мониторинг
pm2 monit

# Nginx статус
curl http://localhost/nginx_status

# Docker логи
docker-compose logs -f
```

## Применение

Критично для:
- Production deployments
- High-traffic applications
- Enterprise solutions
- SaaS platforms
- Mission-critical systems

## Scaling Strategy

1. **Horizontal Scaling**: Добавление новых инстансов
2. **Vertical Scaling**: Увеличение ресурсов существующих
3. **Auto-scaling**: Автоматическое масштабирование по нагрузке
4. **Geographic Distribution**: Развертывание в разных регионах