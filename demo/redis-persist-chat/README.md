---
title: demo/redis-persist-chat/readme
group: demo/redis-persist-chat
---

# Redis Persist Chat

Comprehensive persistence system with Redis for all aspects of agent-swarm: history, state, memory, embedding cache.

## Purpose

Demonstrates capabilities:
- Complete Redis integration for persistence
- Complex storage system with TTL
- Client-server architecture with Redis backend
- Advanced features: policies, states, embeddings

## Key Features

- **Complete Redis Integration**: All data in Redis
- **Multiple Storage Types**: History, State, Memory, Embeddings
- **TTL Support**: Automatic data expiration
- **Policy System**: Crimea and Putin policies for content
- **Advanced Features**: Tic-tac-toe game state, fact storage
- **Embedding Cache**: Vector representation caching

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Database**: Redis (ioredis)
- **ML**: TensorFlow.js for embeddings
- **AI Provider**: Saiga/Yandex GPT

## Project Structure

```
src/
├── config/
│   ├── logger.ts        # Logging
│   ├── persist.ts       # Redis persistence
│   └── tf.ts           # TensorFlow configuration
├── logic/
│   ├── agent/          # Triage agent
│   ├── completion/     # Saiga Yandex GPT
│   ├── embedding/      # Nomic embeddings
│   ├── policy/         # Content policies
│   ├── state/          # Game states
│   ├── storage/        # Fact storage
│   ├── swarm/          # Root swarm
│   └── tools/          # State and storage tools
├── main/
│   ├── client.ts       # WebSocket client
│   └── server.ts       # WebSocket server
└── model/              # Data models
```

## Installation and Setup

```bash
# Install Redis
# Ubuntu/Debian: sudo apt install redis-server
# macOS: brew install redis
# Windows: Download from Redis website

# Start Redis
redis-server

# Install dependencies
bun install

# Start server (terminal 1)
bun run src/main/server.ts

# Start client (terminal 2)
bun run src/main/client.ts
```

## Configuration

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
YANDEX_GPT_API_KEY=your_yandex_api_key
YANDEX_FOLDER_ID=your_folder_id
```

## Usage Examples

### Basic Chat
- "Hello, how are you?"
- "Tell me a joke"

### Game State
- "Let's start a tic-tac-toe game"
- "Put X in the center"

### Fact Storage
- "Remember: my favorite food is pizza"
- "What do you know about me?"

### Policy Testing
- "Tell me about Crimea" (Crimea policy will trigger)

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
- **Crimea Policy**: Content filtering about Crimea
- **Putin Policy**: Restrictions on political topics

### Game State Management
- Tic-tac-toe состояние в Redis
- Persistent game sessions
- State validation и updates

### Embedding Cache
- Vector caching with TTL
- Nomic embeddings for semantic search
- Memory optimization

## Use Cases

Ideal for:
- Production chat systems
- Gaming applications with persistent state
- Knowledge management systems
- Content moderation platforms
- Multi-session applications

## Performance Benefits

- **Fast Access**: Redis in-memory performance
- **Scalability**: Redis cluster support
- **Persistence**: RDB + AOF durability
- **Memory Efficiency**: TTL for automatic cleanup