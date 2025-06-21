---
title: design/26_state_and_storage
group: design
---

# Managing State and Storage

This document covers the data management systems in agent-swarm-kit, including storage with embedding-based search capabilities, client and shared state management, session memory handling, and data persistence patterns. It provides guidance on configuring these systems and best practices for managing data across multi-agent applications.

For information about building multi-agent workflows that use these storage and state systems, see [Building Multi-Agent Systems](./5_Session_Management.md). For details on tool integration that may store or retrieve data, see [Tool Integration](./5_Session_Management.md).

## Storage System Architecture

The framework provides two primary storage systems: client-specific storage and shared storage, both with embedding-based search capabilities.

![Mermaid Diagram](./diagrams\26_Managing_State_and_Storage_0.svg)

**Client Storage Operations**

The `StorageUtils` class provides client-scoped storage operations with embedding search:

| Method | Purpose | Validation |
|--------|---------|------------|
| `take()` | Search and retrieve items | Client session, agent-storage registration |
| `upsert()` | Insert or update items | Client session, agent-storage registration |
| `remove()` | Delete items by ID | Client session, agent-storage registration |
| `get()` | Retrieve item by ID | Agent-storage registration |
| `list()` | List all items with optional filter | Agent-storage registration |
| `createNumericIndex()` | Generate sequential index | Agent-storage registration |
| `clear()` | Remove all items | Client session, agent-storage registration |

**Shared Storage Operations**

The `SharedStorageUtils` class provides system-wide storage without client scoping:

| Method | Purpose | Validation |
|--------|---------|------------|
| `take()` | Search and retrieve items | Storage name validation |
| `upsert()` | Insert or update items | Storage name validation |
| `remove()` | Delete items by ID | Storage name validation |
| `get()` | Retrieve item by ID | Storage name validation |
| `list()` | List all items with optional filter | Storage name validation |
| `clear()` | Remove all items | Storage name validation |

## State Management System

The framework provides both client-specific and shared state management with functional update patterns.

![Mermaid Diagram](./diagrams\26_Managing_State_and_Storage_1.svg)

**Client State Management**

The `StateUtils` class manages client-scoped state with these operations:

- `getState()` - Retrieves current state value for a client and state name
- `setState()` - Updates state using either direct value or dispatch function
- `clearState()` - Resets state to initial value

**Shared State Management**

The `SharedStateUtils` class manages system-wide state:

- `getState()` - Retrieves current shared state value
- `setState()` - Updates shared state using direct value or dispatch function  
- `clearState()` - Resets shared state to initial value

Both state systems support functional updates where you can pass a function that receives the previous state and returns the new state:

## Session Memory Management

Session memory provides temporary, non-persistent storage scoped to individual client sessions.

![Mermaid Diagram](./diagrams\26_Managing_State_and_Storage_2.svg)

**Session Memory Operations**

The `SchemaUtils` class provides session memory management:

- `writeSessionMemory()` - Stores data for a client session with optional persistence
- `readSessionMemory()` - Retrieves data for a client session, loading from persistence if configured
- Session validation ensures operations only occur on valid active sessions

The `MemorySchemaService` provides the underlying memory operations:

- `hasValue()` - Checks if session has memory data
- `writeValue()` - Merges new data with existing session memory
- `readValue()` - Retrieves session memory data 
- `dispose()` - Cleans up session memory on termination

**Memory Persistence Configuration**

Memory persistence is controlled by the `CC_PERSIST_MEMORY_STORAGE` configuration flag. When enabled, session memory is automatically saved to and loaded from JSON files.

## Data Persistence and File Storage

All persistent data in the framework is stored as JSON files in the file system, managed through the persistence layer.

![Mermaid Diagram](./diagrams\26_Managing_State_and_Storage_3.svg)

**Persistence Configuration**

Key configuration options control persistence behavior:

- `CC_PERSIST_ENABLED_BY_DEFAULT` - Controls whether persistence is enabled by default
- `CC_PERSIST_MEMORY_STORAGE` - Enables session memory persistence
- File storage location defaults to `./logs/data/` directory

**Queued Persistence Operations**

The framework uses queued operations to prevent race conditions during concurrent writes. The `SchemaUtils` class demonstrates this pattern with its private queued write function for memory persistence.

## Configuration and Best Practices

### Storage Configuration

**Agent Storage Registration**
Storage must be registered with agents before use. The validation system ensures agents can only access their registered storage:

```typescript
// Storage validation occurs in all storage operations
if (!swarm.agentValidationService.hasStorage(agentName, storageName)) {
  throw new Error(`agent-swarm StorageUtils ${storageName} not registered in ${agentName}`);
}
```

**Embedding Search Configuration**
Storage operations support optional relevance scoring for embedding-based search:

- `take()` method accepts optional `score` parameter for filtering results
- Search queries use embedding similarity to find relevant items
- Total parameter limits the number of results returned

### State Management Patterns

**Functional State Updates**
Use dispatch functions for complex state updates:

```typescript
// Direct value update
await State.setState(newValue, { clientId, agentName, stateName });

// Functional update
await State.setState(async (prevState) => {
  return { ...prevState, newProperty: computedValue };
}, { clientId, agentName, stateName });
```

**State Scoping**
Choose between client-specific and shared state based on data scope:

- Use `StateUtils` for client-specific data that should be isolated per session
- Use `SharedStateUtils` for system-wide data shared across all clients

### Session Memory Patterns

**Temporary Data Storage**
Use session memory for temporary data that doesn't need persistence:

```typescript
// Store temporary session data
const sessionData = await Schema.writeSessionMemory(clientId, { tempValue: data });

// Retrieve session data
const sessionData = await Schema.readSessionMemory(clientId);
```

**Data Serialization**
The `serialize()` method helps format data for display or logging:

```typescript
const formattedData = Schema.serialize(data, {
  mapKey: (key) => key.toUpperCase(),
  mapValue: (key, value) => value.slice(0, 100)
});
```

### Performance Considerations

**Concurrent Operations**
The framework handles concurrent operations through:

- Queued persistence operations to prevent race conditions
- Session validation to ensure operations on active sessions only
- Context scoping for proper operation isolation

**Memory Management**
- Session memory is automatically cleaned up when sessions are disposed
- Use `dispose()` methods to explicitly clean up resources
- Persistence can be disabled for performance-critical applications
