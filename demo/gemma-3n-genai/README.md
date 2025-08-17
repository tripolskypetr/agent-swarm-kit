---
title: demo/gemma-3n-genai/readme
group: demo/gemma-3n-genai
---

# Gemma 3N GenAI

Интеграция с Google Gemini и xAI моделями через modern web framework Hono с WebSocket поддержкой.

## Назначение

Демонстрирует возможности:
- Google Gemini AI интеграции
- xAI (Grok) model support  
- Modern web API с Hono framework
- WebSocket real-time коммуникации
- Multi-provider AI architecture

## Ключевые возможности

- **Google Gemini Integration**: Доступ к latest Gemini models
- **xAI Support**: Grok models для advanced reasoning
- **Hono Web Framework**: Fast, modern web API
- **WebSocket Support**: Real-time bidirectional communication
- **REPL Interface**: Interactive development environment

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Web Framework**: Hono
- **AI Providers**: Google Gemini, xAI
- **Protocols**: HTTP, WebSocket

## Структура проекта

```
src/
├── repl.ts            # REPL interface
└── lib/
    └── swarm.ts       # Swarm configuration
```

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Запуск REPL
bun run src/repl.ts
```

## Конфигурация

Создайте файл `.env`:

```env
GOOGLE_API_KEY=your_google_api_key
XAI_API_KEY=your_xai_api_key
GEMINI_MODEL=gemini-pro
GROK_MODEL=grok-2
PORT=3000
```

## Google Gemini Setup

### Получение API Key
1. Перейдите в [Google AI Studio](https://makersuite.google.com/)
2. Создайте новый проект
3. Получите API ключ
4. Добавьте в `.env` файл

### Supported Models
- **Gemini Pro**: General purpose model
- **Gemini Pro Vision**: Multimodal с image support
- **Gemini Ultra**: Most capable model (when available)

## xAI Integration

### API Access
1. Получите доступ к [xAI API](https://x.ai/)
2. Создайте API ключ
3. Выберите Grok model

### Grok Models
- **Grok-2**: Latest reasoning model
- **Grok-2-Mini**: Faster, cost-effective option
- **Grok-1**: Previous generation

## Примеры использования

### General Questions
- "Объясни квантовые вычисления"
- "Напиши план бизнеса для стартапа"
- "Помоги решить математическую задачу"

### Creative Tasks
- "Напиши стихотворение о природе"
- "Придумай сюжет для фильма"
- "Создай описание персонажа"

### Technical Assistance
- "Объясни архитектуру микросервисов"
- "Как оптимизировать React приложение?"
- "Best practices для TypeScript"

## Model Comparison

| Feature | Gemini Pro | Grok-2 | Grok-2-Mini |
|---------|------------|--------|-------------|
| Reasoning | Excellent | Superior | Good |
| Speed | Fast | Medium | Very Fast |
| Cost | Low | High | Medium |
| Multimodal | Yes | Limited | No |

## Web API Features

### REST Endpoints
```bash
# Chat completion
POST /api/chat
{
  "message": "Hello, how are you?",
  "model": "gemini-pro"
}
```

### WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.send(JSON.stringify({
  message: "Hello via WebSocket",
  model: "grok-2"
}));
```

## Performance Optimization

### Model Selection Strategy
- **Fast Responses**: Grok-2-Mini для quick interactions
- **Complex Reasoning**: Grok-2 для advanced tasks  
- **Multimodal**: Gemini Pro Vision для image tasks
- **Cost Optimization**: Gemini Pro для general use

### Caching
- Response caching для common queries
- Model warming для faster startup
- Connection pooling для efficiency

## Применение

Идеально для:
- Advanced AI applications
- Research и experimentation
- Educational platforms
- Creative writing tools
- Technical consulting

## Development Features

### Hot Reload
```bash
# Development mode с auto-reload
bun --watch src/repl.ts
```

### Debugging
```javascript
// Enable debug logging
process.env.DEBUG = "true"
```

### Testing
```bash
# Test different models
bun run test:gemini
bun run test:grok
```

## Production Deployment

### Docker
```dockerfile
FROM oven/bun:latest
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### Environment
```bash
# Production environment
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT=100
```