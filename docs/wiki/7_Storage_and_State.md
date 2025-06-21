---
title: design/7_storage_and_state
group: design
---

# Storage and State

This document covers the storage and state management systems in the agent-swarm-kit framework. These systems provide persistent data storage with embedding-based search capabilities and managed state with middleware support. Both systems support client-specific and shared modes of operation.

For information about data persistence to the file system, see [Persistence and History](#2.6). For session-level coordination and lifecycle management, see [Session Management](#2.3). For practical guidance on using these systems, see [Managing State and Storage](#5.3).

## System Overview

The agent-swarm-kit framework provides two primary data management systems: **Storage** for searchable data with embedding-based retrieval, and **State** for managed application state with middleware processing. Both systems operate in two modes: client-specific instances scoped to individual sessions, and shared instances accessible across all clients.

![Mermaid Diagram](./diagrams\7_Storage_and_State_0.svg)

## Storage System Architecture

The storage system provides embedding-based data storage with similarity search capabilities. It centers around the `ClientStorage` class which implements the `IStorage` interface and provides operations for data manipulation with vector search.

### Core Storage Implementation

![Mermaid Diagram](./diagrams\7_Storage_and_State_1.svg)

The `ClientStorage` class uses several key patterns:

- **Queued Operations**: All write operations (`upsert`, `remove`, `clear`) go through a queued dispatcher to ensure sequential execution
- **Memoized Embeddings**: The `_createEmbedding` method caches embedding calculations by item ID
- **Singleshot Initialization**: The `waitForInit` method ensures data loading happens exactly once

### Connection Services and Scoping

![Mermaid Diagram](./diagrams\7_Storage_and_State_2.svg)

The connection services provide instance management with different scoping strategies:

- **Client-Specific**: `StorageConnectionService` creates instances keyed by `${clientId}-${storageName}`
- **Shared**: `SharedStorageConnectionService` creates instances keyed by `${storageName}` only, using fixed `clientId: "shared"`
- **Delegation**: Client-specific service delegates to shared service when `shared=true` in schema

## State System Architecture

The state system provides managed application state with middleware processing and queued operations. It centers around the `ClientState` class which implements the `IState` interface.

### Core State Implementation

![Mermaid Diagram](./diagrams\7_Storage_and_State_3.svg)

The `ClientState` class implements several key patterns:

- **Queued Dispatch**: All state operations go through a queued dispatcher for thread safety
- **Middleware Chain**: State updates flow through configurable middleware functions
- **Event Emission**: State changes trigger events via `stateChanged` Subject

### State Connection Services

![Mermaid Diagram](./diagrams\7_Storage_and_State_4.svg)

The state connection services follow similar patterns to storage:

- **Scoped Instances**: Client-specific vs shared instances with different caching keys
- **Queued Updates**: `setState` operations are wrapped with `queued()` for serialization
- **Schema Integration**: Configuration from `StateSchemaService` including middleware and persistence

## Client vs Shared Storage and State

Both storage and state systems support two operational modes that determine data visibility and isolation.

### Client-Specific Mode

In client-specific mode, each session gets its own isolated instance:

| Aspect | Storage | State |
|--------|---------|-------|
| **Instance Key** | `${clientId}-${storageName}` | `${clientId}-${stateName}` |
| **Data Isolation** | Per-session data | Per-session state |
| **Use Cases** | User documents, conversation history | User preferences, session state |
| **Service** | `StorageConnectionService` | `StateConnectionService` |
| **Utility Class** | `StorageUtils` | `StateUtils` |

### Shared Mode

In shared mode, all sessions access the same instance:

| Aspect | Storage | State |
|--------|---------|-------|
| **Instance Key** | `${storageName}` only | `${stateName}` only |
| **Client ID** | Fixed: `"shared"` | Fixed: `"shared"` |
| **Use Cases** | System knowledge base, shared documents | Global configuration, shared counters |
| **Service** | `SharedStorageConnectionService` | `SharedStateConnectionService` |
| **Utility Class** | `SharedStorageUtils` | `SharedStateUtils` |

### Mode Selection

The mode is determined by the `shared` flag in the schema configuration:

```typescript
// Client-specific storage
const storageSchema = {
  storageName: "user-documents",
  shared: false, // or omitted (defaults to false)
  // ...
}

// Shared storage  
const sharedStorageSchema = {
  storageName: "knowledge-base", 
  shared: true,
  // ...
}
```

## Session Memory System

The session memory system provides lightweight, non-persistent storage for session-scoped data through `MemorySchemaService` and `SchemaUtils`.

![Mermaid Diagram](./diagrams\7_Storage_and_State_5.svg)

Session memory provides:

- **Object Merging**: `writeValue()` merges new data with existing session data using `Object.assign()`
- **Session Validation**: `SchemaUtils` methods validate client sessions before memory operations
- **Optional Persistence**: Memory can be persisted to files via `PersistMemoryAdapter` when `CC_PERSIST_MEMORY_STORAGE` is enabled
- **Serialization Utilities**: `serialize()` method flattens objects for display or logging

## Integration with Agent Execution

Storage and state systems integrate with agent execution through utility classes that provide validated access patterns.

### Agent Storage Access

![Mermaid Diagram](./diagrams\7_Storage_and_State_6.svg)

The utility classes enforce a three-layer validation:

1. **Session Validation**: Ensure the client session is valid
2. **Resource Validation**: Ensure the storage/state exists in schema
3. **Agent Permission**: Ensure the agent is registered to use the resource

### State Access Patterns

![Mermaid Diagram](./diagrams\7_Storage_and_State_7.svg)

State utilities support both direct value assignment and function-based dispatch:

- **Direct Assignment**: `setState(newValue, payload)` sets state directly
- **Function Dispatch**: `setState(async (prev) => newValue, payload)` computes new state from previous
- **Shared Access**: Shared state utilities bypass agent validation since shared resources are globally accessible
