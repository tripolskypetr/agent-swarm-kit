---
title: demo/client-server-chat/readme
group: demo/client-server-chat
---

# Client Server Chat

Basic client-server chat implementation using WebSocket and agent-swarm-kit.

## Purpose

Demonstrates fundamental capabilities:
- WebSocket connection implementation between client and server
- agent-swarm-kit integration in client-server architecture
- Real-time message processing through agents
- Basic architecture for scalable chat systems

## Key Features

- **WebSocket Communication**: Bidirectional real-time communication
- **Client-Server Architecture**: Separation of client and server logic
- **Agent Integration**: Message processing through agents
- **Testing Environment**: Simple setup for learning concepts

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Protocol**: WebSocket
- **AI Providers**: Ollama, OpenAI

## Project Structure

```
src/
├── client.ts      # WebSocket client
├── server.ts      # WebSocket server
└── lib/
    └── swarm.ts   # Swarm configuration
```

## Installation and Setup

```bash
# Install dependencies
bun install

# Run server (terminal 1)
bun run src/server.ts

# Run client (terminal 2)
bun run src/client.ts
```

## Configuration

Create a `.env` file:

```env
OLLAMA_API_URL=http://localhost:11434
OPENAI_API_KEY=your_openai_api_key
WS_PORT=8080
```

## Usage Examples

1. **Send Message**: Enter text in the client
2. **Receive Response**: Agent processes message and returns response
3. **Real-time Communication**: Instant message exchange

## Applications

This project serves as foundation for:
- Chatbots and virtual assistants
- Customer support systems
- Educational platforms
- Interactive web applications

## Extension

Can be expanded by adding:
- User authentication
- Message persistence
- Multiple rooms
- File attachments