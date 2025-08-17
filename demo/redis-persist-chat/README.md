---
title: demo/redis-persist-chat/readme
group: demo/redis-persist-chat
---

# Redis Persist Chat

Комплексная система персистентности с Redis для всех аспектов agent-swarm: история, состояние, память, embedding кеш.

## Назначение

Демонстрирует возможности:
- Полной Redis интеграции для персистентности
- Комплексной системы storage с TTL
- Client-server архитектуры с Redis backend
- Advanced features: policies, states, embeddings

## Ключевые возможности

- **Complete Redis Integration**: Все данные в Redis
- **Multiple Storage Types**: History, State, Memory, Embeddings
- **TTL Support**: Автоматическое истечение данных
- **Policy System**: Crimea и Putin policies для контента
- **Advanced Features**: Tic-tac-toe game state, fact storage
- **Embedding Cache**: Кеширование векторных представлений

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Database**: Redis (ioredis)
- **ML**: TensorFlow.js для embeddings
- **AI Provider**: Saiga/Yandex GPT

## Структура проекта

```
src/
├── config/
│   ├── logger.ts        # Логирование
│   ├── persist.ts       # Redis персистентность
│   └── tf.ts           # TensorFlow конфигурация
├── logic/
│   ├── agent/          # Triage агент
│   ├── completion/     # Saiga Yandex GPT
│   ├── embedding/      # Nomic embeddings
│   ├── policy/         # Content policies
│   ├── state/          # Game states
│   ├── storage/        # Fact storage
│   ├── swarm/          # Root swarm
│   └── tools/          # State и storage tools
├── main/
│   ├── client.ts       # WebSocket клиент
│   └── server.ts       # WebSocket сервер
└── model/              # Data models
```

## Установка и запуск

```bash
# Установка Redis
# Ubuntu/Debian: sudo apt install redis-server
# macOS: brew install redis
# Windows: Download from Redis website

# Запуск Redis
redis-server

# Установка зависимостей
bun install

# Запуск сервера (терминал 1)
bun run src/main/server.ts

# Запуск клиента (терминал 2)
bun run src/main/client.ts
```

## Конфигурация

Создайте файл `.env`:

```env
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
YANDEX_GPT_API_KEY=your_yandex_api_key
YANDEX_FOLDER_ID=your_folder_id
```

## Примеры использования

### Basic Chat
- "Привет, как дела?"
- "Расскажи анекдот"

### Game State
- "Начнем игру в крестики-нолики"
- "Поставь X в центр"

### Fact Storage
- "Запомни: моя любимая еда - пицца"
- "Что ты знаешь обо мне?"

### Policy Testing
- "Расскажи про Крым" (сработает Crimea policy)

## Redis Storage Schema

```
agent-swarm:history:{clientId}:{messageId}
agent-swarm:state:{clientId}:{stateType}
agent-swarm:memory:{clientId}:{memoryKey}
agent-swarm:embedding:{textHash}
agent-swarm:storage:{storageType}:{key}
```

## Advanced Features

### Content Policies
- **Crimea Policy**: Фильтрация контента о Крыме
- **Putin Policy**: Ограничения на политические темы

### Game State Management
- Tic-tac-toe состояние в Redis
- Persistent game sessions
- State validation и updates

### Embedding Cache
- Vector caching с TTL
- Nomic embeddings для semantic search
- Memory optimization

## Применение

Идеально для:
- Production chat systems
- Gaming applications с persistent state
- Knowledge management systems
- Content moderation platforms
- Multi-session applications

## Performance Benefits

- **Fast Access**: Redis in-memory performance
- **Scalability**: Redis cluster support
- **Persistence**: RDB + AOF durability
- **Memory Efficiency**: TTL для automatic cleanup