---
title: design/08_storage_and_state
group: design
---

# Storage and State

This document covers the storage and state management systems in the agent-swarm-kit framework. These systems provide persistent data storage with embedding-based search capabilities and managed state with middleware support. Both systems support client-specific and shared modes of operation.

For information about data persistence to the file system, see [Persistence and History](./09_Persistence_and_History.md). For session-level coordination and lifecycle management, see [Session Management](./06_Session_and_Chat_Management.md). For practical guidance on using these systems, see [Managing State and Storage](./25_Managing_State_and_Storage.md).

## System Overview

The agent-swarm-kit framework provides two primary data management systems: **Storage** for searchable data with embedding-based retrieval, and **State** for managed application state with middleware processing. Both systems operate in two modes: client-specific instances scoped to individual sessions, and shared instances accessible across all clients.

![Mermaid Diagram](./diagrams\8_Storage_and_State_0.svg)

## Storage System Architecture

The storage system provides embedding-based data storage with similarity search capabilities. It centers around the `ClientStorage` class which implements the `IStorage` interface and provides operations for data manipulation with vector search.

### Core Storage Implementation

![Mermaid Diagram](./diagrams\8_Storage_and_State_1.svg)

The `ClientStorage` class uses several key patterns:

- **Queued Operations**: All write operations (`upsert`, `remove`, `clear`) go through a queued dispatcher to ensure sequential execution
- **Memoized Embeddings**: The `_createEmbedding` method caches embedding calculations by item ID
- **Singleshot Initialization**: The `waitForInit` method ensures data loading happens exactly once

### Connection Services and Scoping

![Mermaid Diagram](./diagrams\8_Storage_and_State_2.svg)

The connection services provide instance management with different scoping strategies:

- **Client-Specific**: `StorageConnectionService` creates instances keyed by `${clientId}-${storageName}`
- **Shared**: `SharedStorageConnectionService` creates instances keyed by `${storageName}` only, using fixed `clientId: "shared"`
- **Delegation**: Client-specific service delegates to shared service when `shared=true` in schema

## State System Architecture

The state system provides managed application state with middleware processing and queued operations. It centers around the `ClientState` class which implements the `IState` interface.

### Core State Implementation

![Mermaid Diagram](./diagrams\8_Storage_and_State_3.svg)

The `ClientState` class implements several key patterns:

- **Queued Dispatch**: All state operations go through a queued dispatcher for thread safety
- **Middleware Chain**: State updates flow through configurable middleware functions
- **Event Emission**: State changes trigger events via `stateChanged` Subject

### State Connection Services

![Mermaid Diagram](./diagrams\8_Storage_and_State_4.svg)

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

## Persistence Integration

Both storage and state systems integrate with the persistence layer through adapter patterns that enable file system storage and embedding caching.

![Mermaid Diagram](./diagrams\8_Storage_and_State_5.svg)

The persistence layer provides:

- **Storage Persistence**: `PersistStorageAdapter` handles saving/loading storage item arrays
- **State Persistence**: `PersistStateAdapter` handles saving/loading state values with middleware processing
- **Embedding Caching**: `PersistEmbeddingAdapter` caches computed embeddings by content hash to avoid recomputation
- **Configuration Control**: Persistence is enabled per schema via `persist` flag or global `CC_PERSIST_ENABLED_BY_DEFAULT`

### State Dispatch and Middleware Patterns

![Mermaid Diagram](./diagrams\8_Storage_and_State_6.svg)

State management follows a structured dispatch pattern:

- **Queued Dispatch**: All state operations use `queued()` decorator for sequential execution and thread safety
- **Function-Based Updates**: State changes use `(prevState) => Promise<newState>` pattern for computed updates
- **Middleware Processing**: Each state update flows through configured middleware functions in sequence
- **Event Emission**: State changes trigger both Subject notifications and bus events for system integration

### Storage and State Access Validation

![Mermaid Diagram](./diagrams\8_Storage_and_State_7.svg)

The public services enforce context validation and scope operations:

1. **Method Context**: `MethodContextService.runInContext()` provides execution scope with client and resource identifiers
2. **Session Tracking**: `SessionValidationService` tracks storage and state usage per client for lifecycle management
3. **Connection Memoization**: Connection services cache instances by composite keys (`clientId-resourceName`)

## Integration with Agent Execution

Storage and state systems integrate with agent execution through utility classes that provide validated access patterns.

### Agent Storage Access

![Mermaid Diagram](./diagrams\8_Storage_and_State_8.svg)

The utility classes enforce a three-layer validation:

1. **Session Validation**: Ensure the client session is valid
2. **Resource Validation**: Ensure the storage/state exists in schema
3. **Agent Permission**: Ensure the agent is registered to use the resource

### State Access Patterns

![Mermaid Diagram](./diagrams\8_Storage_and_State_9.svg)

State utilities support both direct value assignment and function-based dispatch:

- **Direct Assignment**: `setState(newValue, payload)` sets state directly
- **Function Dispatch**: `setState(async (prev) => newValue, payload)` computes new state from previous
- **Shared Access**: Shared state utilities bypass agent validation since shared resources are globally accessible
