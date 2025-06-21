---
title: wiki/examples
group: wiki
---

# Examples

This page demonstrates real-world applications built with the agent-swarm-kit framework. The examples showcase different integration patterns, from simple WebSocket-based chat systems to complex multi-agent workflows. These examples serve as practical templates for building agent-based applications.

For information about the core framework concepts, see [Core Components](#2). For implementation guidance, see [Usage Patterns](#5).

## Available Examples Overview

The agent-swarm-kit repository contains multiple demonstration applications that illustrate different use cases and integration patterns:

| Example | Description | Key Features |
|---------|-------------|--------------|
| client-server-chat | WebSocket-based real-time chat | Session management, real-time communication |
| binance-candle-chat | Cryptocurrency trading system | Multi-agent coordination, financial data processing |
| it-consulting-swarm | IT consulting chatbot | Agent routing, specialized knowledge domains |
| whisper-voice-chat | Voice-based interaction | Speech recognition, audio processing |
| redis-persist-chat | Persistent chat with Redis | State persistence, conversation history |
| telegram-ollama-chat | Telegram bot integration | Third-party platform integration |
| nginx-balancer-chat | Load-balanced chat system | Scalability, load distribution |

## Client-Server Chat Example

The client-server chat example demonstrates a complete WebSocket-based real-time chat application using the agent-swarm-kit framework. This example showcases session management, real-time bidirectional communication, and proper resource cleanup.

### System Architecture

![Mermaid Diagram](./diagrams\27_Examples_0.svg)

### Server Implementation

The server implementation uses Bun's WebSocket capabilities to handle real-time communication:

![Mermaid Diagram](./diagrams\27_Examples_1.svg)

The server creates sessions using the `session()` function from agent-swarm-kit, which manages the agent lifecycle and handles message processing through the `complete()` method.

### Client Implementation

The client implementation demonstrates how to build a terminal-based interface that communicates with the agent system:

![Mermaid Diagram](./diagrams\27_Examples_2.svg)

The client uses the `Subject` pattern from functools-kit to handle asynchronous message flows and implements a readline interface for user interaction.

### Session Management Details

The example demonstrates proper session lifecycle management:

| Lifecycle Stage | Server Code | Framework Integration |
|----------------|-------------|----------------------|
| Session Creation | `session(clientId, SwarmName.TestSwarm)` | Initializes agent context and resources |
| Message Processing | `session.complete(data)` | Routes message through agent pipeline |
| Agent Identification | `getAgentName(clientId)` | Retrieves current active agent name |
| Resource Cleanup | `session.dispose()` | Cleans up session state and connections |

The server stores session data in the WebSocket data object, ensuring each connection maintains its own isolated agent context.

### Project Structure

The client-server-chat example follows a standard structure:

![Mermaid Diagram](./diagrams\27_Examples_3.svg)

### Running the Example

The example provides separate scripts for running the client and server components:

- `bun run start:server` - Starts the WebSocket server on port 1337
- `bun run start:client` - Starts the terminal client interface
- `bun run build:docs` - Generates documentation

The server listens on `0.0.0.0:1337` and accepts WebSocket connections with a `clientId` query parameter.

## Other Example Applications

The framework documentation references several additional examples that demonstrate different aspects of agent-swarm-kit:

### Trading Bot Example
The `binance-candle-chat` example implements a cryptocurrency trading system with specialized agents for different cryptocurrencies (BTC, ETH, BNB, XRP, SOL). It features a triage agent that routes requests to appropriate trading agents, demonstrating multi-agent coordination and financial data processing.

### Voice Integration Example  
The `whisper-voice-chat` example showcases voice-based interaction using Whisper for real-time transcription and Nemotron Mini for natural language processing, demonstrating integration with speech recognition systems.

### Persistence Example
The `redis-persist-chat` example demonstrates persistent conversation history and state management using Redis, showing how to maintain long-term agent memory across sessions.

### Platform Integration Example
The `telegram-ollama-chat` example illustrates integration with third-party platforms, specifically Telegram, while using Ollama for local AI model hosting.

## Integration Patterns

These examples demonstrate several key integration patterns:

1. **Session-based Communication** - Using `session()` for persistent agent interactions
2. **Real-time Messaging** - WebSocket integration for bidirectional communication  
3. **Resource Management** - Proper disposal of sessions and connections
4. **Multi-agent Coordination** - Routing between specialized agents
5. **External Service Integration** - Connecting to APIs, databases, and third-party platforms

Each example serves as a template for building similar applications with the agent-swarm-kit framework.
