---
title: design/8_persistance_and_history
group: design
---

# Persistence and History

This document covers the file-system based persistence layer and message history management within agent-swarm-kit. The persistence system provides reliable JSON-based storage for agent states, conversation history, and swarm metadata, while the history management system handles both in-memory and persistent storage of agent conversations.

For information about client-side data management, see [Storage and State](#2.5). For details about session lifecycle management, see [Session Management](#2.3).

## Core Persistence Architecture

The persistence layer is built around two foundational classes that provide JSON file-based storage with atomic write operations and directory management.

### PersistBase Class

`PersistBase` serves as the foundation for all persistent storage operations in the swarm system. It manages entities as JSON files within organized directory structures, providing CRUD operations with built-in validation and error handling.

![Mermaid Diagram](./diagrams\8_Persistence_and_History_0.svg)

### PersistList Class

`PersistList` extends `PersistBase` to provide ordered list semantics with push and pop operations. It maintains sequential numeric keys and supports queue-like operations for message storage and event logging.

![Mermaid Diagram](./diagrams\8_Persistence_and_History_1.svg)

## History Management System

The history management system provides both persistent and in-memory storage options for agent conversation history, with support for filtering, system prompts, and lifecycle callbacks.

### History Instance Types

Two primary implementations handle different persistence requirements:

![Mermaid Diagram](./diagrams\8_Persistence_and_History_2.svg)

### History Lifecycle and Callbacks

History instances support comprehensive lifecycle management through the `IHistoryInstanceCallbacks` interface:

| Callback | Purpose | When Called |
|----------|---------|-------------|
| `onInit` | Instance initialization | During `waitForInit()` |
| `onPush` | Message addition | Before adding to history |
| `onPop` | Message removal | Before removing from history |
| `onChange` | History modification | After push/pop operations |
| `onRead` | Message iteration | During history reading |
| `onReadBegin` | Iteration start | Before message iteration |
| `onReadEnd` | Iteration completion | After message iteration |
| `onDispose` | Instance cleanup | During disposal |

## Persistence Utilities

Specialized utility classes provide domain-specific persistence operations for different swarm components.

### Swarm Persistence (PersistSwarmUtils)

Manages active agent tracking and navigation stack persistence per swarm:

![Mermaid Diagram](./diagrams\8_Persistence_and_History_3.svg)

### State and Storage Persistence

`PersistStateUtils` and `PersistStorageUtils` provide similar patterns for state management and storage data persistence:

- **State Persistence**: Manages client state data per `StateName`
- **Storage Persistence**: Handles storage data arrays per `StorageName`

Both follow the same memoization and factory pattern for efficient resource management.

## File System Organization

The persistence layer organizes data in a hierarchical directory structure under `./logs/data/`:

![Mermaid Diagram](./diagrams\8_Persistence_and_History_4.svg)

Each directory contains JSON files named by entity IDs, with atomic write operations ensuring data consistency across concurrent access.

## Integration with Agent System

The persistence and history systems integrate seamlessly with the broader agent architecture:

![Mermaid Diagram](./diagrams\8_Persistence_and_History_5.svg)

This integration ensures that agent conversations, state changes, and navigation history are automatically persisted and can be recovered across system restarts.
