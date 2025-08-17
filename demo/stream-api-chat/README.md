---
title: demo/stream-api-chat/readme
group: demo/stream-api-chat
---

# Stream API Chat

REST API с streaming support и Grok integration на базе Hono web framework.

## Назначение

Демонстрирует возможности:
- REST API интеграции с agent-swarm-kit
- Streaming и synchronous endpoints
- Grok (xAI) модель интеграции
- Production-ready web API архитектуры

## Ключевые возможности

- **Dual API Modes**: Streaming и synchronous endpoints
- **Grok Integration**: xAI/Grok модели для AI responses
- **Hono Framework**: Современный, быстрый web framework
- **WebSocket Support**: Real-time коммуникация
- **Production Ready**: Готовность к production deployment

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Web Framework**: Hono
- **AI Provider**: xAI/Grok
- **Protocols**: HTTP REST, WebSocket

## Структура проекта

```
src/
├── config/
│   ├── app.ts          # App конфигурация
│   ├── grok.ts         # Grok API setup
│   └── params.ts       # Parameters
├── logic/
│   ├── agent/          # Triage агент
│   ├── completion/     # Grok completions
│   ├── enum/           # Перечисления
│   └── swarm/          # Root swarm
├── main/
│   └── hono.ts         # Hono server
├── routes/
│   ├── stream.ts       # Streaming endpoint
│   └── sync.ts         # Synchronous endpoint
└── index.ts            # Entry point
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск сервера
bun run src/index.ts
```

## Конфигурация

Создайте файл `.env`:

```env
GROK_API_KEY=your_grok_api_key
API_PORT=3000
```

## API Endpoints

### Streaming Endpoint
```bash
# POST /api/stream
curl -X POST http://localhost:3000/api/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you help me with?"}'
```

### Synchronous Endpoint
```bash
# POST /api/sync
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain quantum physics"}'
```

### WebSocket Endpoint
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.send(JSON.stringify({message: "Hello via WebSocket"}));
```

## Response Formats

### Streaming Response
```
data: {"chunk": "Hello", "done": false}
data: {"chunk": " there", "done": false}
data: {"chunk": "!", "done": true}
```

### Synchronous Response
```json
{
  "message": "Hello there! How can I help you today?",
  "timestamp": "2024-01-01T00:00:00Z",
  "model": "grok-2-mini"
}
```

## Grok Advantages

- **Latest Model**: State-of-the-art performance
- **Fast Responses**: Optimized for speed
- **Cost Effective**: Competitive pricing
- **Real-time**: Excellent for streaming

## Применение

Идеально для:
- Web applications requiring AI
- Mobile app backends
- Microservices architectures
- API-first applications
- Third-party integrations

## Development Features

- **Hot Reload**: Автоматическая перезагрузка при изменениях
- **Type Safety**: Полная типизация с TypeScript
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging для debugging

## Production Deployment

```bash
# Docker deployment
docker build -t stream-api-chat .
docker run -p 3000:3000 stream-api-chat

# PM2 deployment
pm2 start src/index.ts --name "stream-api"
```