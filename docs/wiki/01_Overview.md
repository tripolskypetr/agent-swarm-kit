---
title: design/01_overview
group: design
---

# Overview

## Purpose and Scope

Agent Swarm Kit is a TypeScript framework for building orchestrated, multi-agent AI systems that can collaborate to solve complex problems. The library provides a comprehensive platform for creating agent networks where specialized AI agents can communicate, navigate between each other, execute tools, and maintain shared state across client sessions.

This document covers the foundational architecture and core components of the system. For specific implementation patterns, see [Building Multi-Agent Systems](#5.1). For API details, see [Core API Functions](#7.1). For integration examples, see [Examples and Testing](#6).

The framework is designed to be framework-agnostic, supporting multiple AI providers (OpenAI, Ollama, Claude, etc.) and offering features like automatic session orchestration, Model Context Protocol (MCP) integration, Redis persistence, and operator escalation capabilities.

Sources: [package.json:1-89](), [README.md:1-505](), [src/index.ts:1-279]()

## System Architecture Overview

The agent-swarm-kit follows a layered architecture centered around a dependency injection container that coordinates all system components. The architecture enables scalable multi-agent orchestration with clear separation between public APIs, service layers, and core implementations.

### High-Level System Flow

![Mermaid Diagram](./diagrams\1_Overview_0.svg)

## Core Components

### Agent Execution Engine

The `ClientAgent` class serves as the core execution engine for individual agents, handling message processing, tool calls, and AI model interactions:

![Mermaid Diagram](./diagrams\1_Overview_2.svg)

The `ClientAgent` implements sophisticated execution patterns including tool call validation, model recovery strategies, and event-driven communication through subjects for handling agent state changes, tool outputs, and error conditions.

Sources: [src/client/ClientAgent.ts:1-1058](), [src/interfaces/Agent.interface.ts:1-585]()

### Session Management

The session layer manages client connections and message flow through the swarm system:

![Mermaid Diagram](./diagrams\1_Overview_3.svg)

The `ClientSession` enforces policy validation for both input and output messages, coordinates with the swarm for agent execution, and provides event-driven messaging capabilities for real-time client communication.

Sources: [src/client/ClientSession.ts:1-387](), [src/interfaces/Session.interface.ts:1-149]()

### Swarm Orchestration

The swarm layer coordinates multiple agents and manages navigation between them:

| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| `ClientSwarm` | Agent coordination and navigation | `getAgent()`, `changeToAgent()`, `emit()` |
| `SwarmConnectionService` | Swarm lifecycle management | `getSwarm()`, navigation stack handling |
| `SwarmPublicService` | Public swarm API | Agent name resolution, output coordination |

The swarm maintains a navigation stack that allows agents to call each other and return to previous contexts, enabling complex multi-agent workflows with proper state management.

Sources: [src/lib/services/connection/SwarmConnectionService.ts:1-400](), [src/lib/services/public/SwarmPublicService.ts:1-500]()

## Message Processing Flow

The system processes messages through a well-defined pipeline that ensures proper validation, execution, and output handling:

![Mermaid Diagram](./diagrams\1_Overview_4.svg)

This flow demonstrates the coordination between layers and the sophisticated tool execution pipeline that handles both simple completions and complex multi-tool workflows.

Sources: [src/client/ClientAgent.ts:319-530](), [src/client/ClientSession.ts:149-250]()

## Key Integration Points

### AI Model Integration

The framework supports multiple AI providers through the `ICompletion` interface and adapter pattern:

- **OpenAI**: Complete API support including function calling
- **Ollama**: Local model integration with tool support  
- **Claude**: Anthropic's models with MCP integration
- **Custom Models**: Extensible adapter system for any provider

### Storage and Persistence

Multiple storage backends are supported for different use cases:

- **Memory Storage**: Fast in-memory storage for development
- **Redis Integration**: Production-ready persistence with clustering support
- **File System**: Local persistence with configurable paths
- **Custom Storage**: Pluggable storage interface for specialized needs

### External Tool Integration

The Model Context Protocol (MCP) enables integration with external tools and services, allowing agents to access capabilities written in different languages and running on separate systems.

Sources: [src/interfaces/MCP.interface.ts:1-200](), [src/classes/Adapter.ts:1-400](), [README.md:15-35]()