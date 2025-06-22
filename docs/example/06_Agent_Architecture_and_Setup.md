---
title: example/06_agent_architecture_and_setup
group: example
---

# Agent Architecture and Setup

This document explains the configuration and architecture of the AI agent system built on the `agent-swarm-kit` framework. It covers the Redis-based persistence layer, agent registration patterns, and session management infrastructure that enables the cryptocurrency consultation agents to operate.

For information about specific agent implementations and their capabilities, see [Cryptocurrency Consultant Agents](./07_Cryptocurrency_Consultant_Agents.md). For details about agent routing and navigation between different specialists, see [Agent Navigation and Routing](./08_Agent_Navigation_and_Routing.md).

## Framework Configuration and Setup

The agent system is built on the `agent-swarm-kit` framework, configured through the main setup file with Redis persistence and logging infrastructure.

### Core Framework Configuration

The system initializes with specific configuration parameters and custom adapters:

![Mermaid Diagram](./diagrams\6_Agent_Architecture_and_Setup_0.svg)

### Chat Session Configuration

The `ChatInstance` is extended with single-run protection to prevent concurrent message processing:

| Component | Configuration | Purpose |
|-----------|---------------|---------|
| `Chat.useChatAdapter` | `singlerun(sendMessage)` | Prevents concurrent message processing |
| `swarm.loggerService` | `pinolog` logger | Centralized logging for agent operations |
| `Logger.useClientAdapter` | Per-client file logging | Individual chat session logs |

## Persistence Architecture

The system uses Redis as the primary persistence layer with multiple specialized adapters for different data types.

### Redis Persistence Adapters

![Mermaid Diagram](./diagrams\6_Agent_Architecture_and_Setup_1.svg)

### TTL Configuration

Different persistence layers have specific time-to-live configurations:

| Adapter | TTL | Purpose |
|---------|-----|---------|
| `PersistEmbedding` | 604800s (1 week) | Cache AI embeddings |
| `History` | 900s (15 minutes) | Chat message history |
| `PersistAlive` | 600s (10 minutes) | Client online status |

## Agent Registration and Configuration

Agents are registered using the `addAgent` function with specific configuration objects that define their behavior, tools, and dependencies.

### Agent Configuration Structure

![Mermaid Diagram](./diagrams\6_Agent_Architecture_and_Setup_2.svg)

### Agent Callback System

Agents can define callback functions for error handling and lifecycle events:

| Callback | Purpose | Implementation |
|----------|---------|----------------|
| `onToolError` | Handle tool execution errors | Logs errors to file with client context |
| `onResurrect` | Handle agent resurrection | Sends notification to Telegram users |

## Chat Session Management

The system manages chat sessions through the `Chat` API with support for multiple client types and swarm configurations.

### Session Lifecycle

![Mermaid Diagram](./diagrams\6_Agent_Architecture_and_Setup_3.svg)

### Integration Points

The agent system integrates with multiple interfaces:

| Interface | Client ID Pattern | Event Handling |
|-----------|------------------|----------------|
| WebSocket | `web-{chatId}` | Token streaming, completion events |
| Telegram | `telegram-{chatId}` | Message formatting, HTML conversion |

### Error Handling and Logging

The system includes comprehensive error handling and logging:

![Mermaid Diagram](./diagrams\6_Agent_Architecture_and_Setup_4.svg)
