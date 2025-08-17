---
title: demo/stream-api-chat/readme
group: demo/stream-api-chat
---

# Stream API Chat

REST API with streaming support and Grok integration based on Hono web framework.

## Purpose

Demonstrates capabilities:
- REST API integration with agent-swarm-kit
- Streaming and synchronous endpoints
- Grok (xAI) model integration
- Production-ready web API architecture

## Key Features

- **Dual API Modes**: Streaming and synchronous endpoints
- **Grok Integration**: xAI/Grok models for AI responses
- **Hono Framework**: Modern, fast web framework
- **WebSocket Support**: Real-time communication
- **Production Ready**: Ready for production deployment

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Web Framework**: Hono
- **AI Provider**: xAI/Grok
- **Protocols**: HTTP REST, WebSocket

## Project Structure

```
src/
├── config/
│   ├── app.ts          # App configuration
│   ├── grok.ts         # Grok API setup
│   └── params.ts       # Parameters
├── logic/
│   ├── agent/          # Triage agent
│   ├── completion/     # Grok completions
│   ├── enum/           # Enumerations
│   └── swarm/          # Root swarm
├── main/
│   └── hono.ts         # Hono server
├── routes/
│   ├── stream.ts       # Streaming endpoint
│   └── sync.ts         # Synchronous endpoint
└── index.ts            # Entry point
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Start server
bun run src/index.ts
```

## Configuration

Create a `.env` file:

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

## Use Cases

Ideal for:
- Web applications requiring AI
- Mobile app backends
- Microservices architectures
- API-first applications
- Third-party integrations

## Development Features

- **Hot Reload**: Automatic reload on changes
- **Type Safety**: Full typing with TypeScript
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging for debugging

## Production Deployment

```bash
# Docker deployment
docker build -t stream-api-chat .
docker run -p 3000:3000 stream-api-chat

# PM2 deployment
pm2 start src/index.ts --name "stream-api"
```