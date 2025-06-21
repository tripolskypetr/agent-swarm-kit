---
title: wiki/public_services
group: wiki
---

# Public Services

Public Services form the external API layer of the agent-swarm-kit framework, providing a clean interface for applications to interact with the swarm system. They act as a facade that delegates operations to Connection Services while handling cross-cutting concerns like context scoping, logging, and parameter validation.

For information about the underlying service instances and lifecycle management, see [Connection Services](#3.3). For service registration and dependency injection patterns, see [Dependency Injection](#3.1). For schema-driven service configuration, see [Schema Services](#3.2).

## Architecture Overview

Public Services implement a consistent delegation pattern where they wrap Connection Service operations with `MethodContextService` for proper context scoping. This ensures that operations are executed with the correct `clientId`, `agentName`, `swarmName`, and other contextual parameters.

### Public Service Layer Structure

![Mermaid Diagram](./diagrams\17_Public_Services_0.svg)

Sources: [src/lib/services/public/AgentPublicService.ts:1-180](), [src/lib/services/public/SessionPublicService.ts:1-205](), [src/lib/services/connection/SwarmConnectionService.ts:1-277]()

## Core Public Service Classes

The framework provides twelve main Public Service classes, each responsible for a specific domain of functionality:

| Service Class | Purpose | Delegates To | Key Operations |
|---------------|---------|--------------|----------------|
| `AgentPublicService` | Agent operations | `AgentConnectionService` | `execute`, `run`, `commitToolOutput` |
| `SessionPublicService` | Session management | `SessionConnectionService` | `emit`, `connect`, `commitUserMessage` |
| `StoragePublicService` | Client storage | `StorageConnectionService` | `take`, `upsert`, `remove`, `list` |
| `StatePublicService` | Client state | `StateConnectionService` | `setState`, `getState`, `clearState` |
| `SwarmPublicService` | Swarm coordination | `SwarmConnectionService` | `navigationPop`, `waitForOutput`, `getAgent` |
| `HistoryPublicService` | Message history | `HistoryConnectionService` | `push`, `pop`, `toArrayForAgent` |
| `SharedStoragePublicService` | Global storage | `SharedStorageConnectionService` | `take`, `upsert`, `remove`, `list` |
| `SharedStatePublicService` | Global state | `SharedStateConnectionService` | `setState`, `getState`, `clearState` |
| `PolicyPublicService` | Policy enforcement | `PolicyConnectionService` | `banClient`, `getAllowedOrigins`, `validate` |
| `MCPPublicService` | MCP integration | `MCPConnectionService` | `listTools`, `callTool`, `getResources` |
| `ComputePublicService` | Client compute | `ComputeConnectionService` | `setState`, `getState`, `clearState` |
| `SharedComputePublicService` | Global compute | `SharedComputeConnectionService` | `setState`, `getState`, `clearState` |

Sources: [docs/classes/AgentPublicService.md:1-180](), [docs/classes/SessionPublicService.md:1-205](), [src/lib/services/public/StoragePublicService.ts:1-420](), [src/lib/services/public/StatePublicService.ts:1-150]()

## Delegation Pattern

Public Services follow a consistent delegation pattern that provides several key benefits:

### Method Context Scoping

Every public method wraps its Connection Service call with `MethodContextService.runInContext()` to establish proper execution context:

![Mermaid Diagram](./diagrams\17_Public_Services_1.svg)

Sources: [src/lib/services/public/AgentPublicService.ts:50-60](), [docs/classes/SessionPublicService.md:96-104]()

### Type Safety with Internal Key Exclusion

Public Services use TypeScript mapped types to exclude internal methods from their interfaces:

![Mermaid Diagram](./diagrams\17_Public_Services_2.svg)

This pattern ensures that internal methods like `getAgent()` in `AgentConnectionService` or `getSwarm()` in `SwarmConnectionService` are not exposed in the public API.

Sources: [src/lib/services/public/AgentPublicService.ts:14-33](), [src/lib/services/public/SwarmPublicService.ts:14-33](), [src/lib/services/public/StoragePublicService.ts:14-33]()

## Context Management

The `MethodContextService` integration is central to Public Service operations. Each method call establishes a complete execution context:

### Context Structure

```typescript
interface IMethodContext {
  methodName: string;    // The calling method name
  clientId: string;      // Session identifier  
  agentName: string;     // Active agent
  swarmName: string;     // Target swarm
  storageName: string;   // Storage scope
  stateName: string;     // State scope
  mcpName: string;       // MCP integration
  computeName: string;   // Compute resource
  policyName: string;    // Policy enforcement
}
```

This context allows Connection Services to operate without requiring these parameters explicitly, as they can retrieve context via dependency injection.

Sources: [src/lib/services/public/AgentPublicService.ts:84-98](), [src/lib/services/public/SessionPublicService.ts:83-97]()

## Logging Integration

All Public Services integrate with `LoggerService` for consistent logging when `GLOBAL_CONFIG.CC_LOGGER_ENABLE_INFO` is enabled:

![Mermaid Diagram](./diagrams\17_Public_Services_3.svg)

The logging includes method name, parameters, and contextual information for debugging and monitoring.

Sources: [src/lib/services/public/AgentPublicService.ts:56-62](), [docs/classes/SessionPublicService.md:75-85](), [src/lib/services/public/StoragePublicService.ts:73-82]()

## Service Responsibilities

### Agent Operations (`AgentPublicService`)

Provides the primary interface for agent execution and lifecycle management:

- **Execution**: `execute()` for stateful operations, `run()` for stateless completions
- **History Management**: `commitUserMessage()`, `commitSystemMessage()`, `commitAssistantMessage()`
- **Tool Integration**: `commitToolOutput()`, `commitToolRequest()`
- **Flow Control**: `commitStopTools()`, `commitAgentChange()`, `commitFlush()`

Sources: [docs/classes/AgentPublicService.md:50-180]()

### Session Management (`SessionPublicService`)

Handles client session lifecycle and communication:

- **Messaging**: `emit()` for async communication, `notify()` for notifications
- **Execution**: `execute()` and `run()` at session level with validation
- **Connection**: `connect()` for bidirectional communication channels
- **Performance**: Integration with `PerfService` for execution tracking

Sources: [docs/classes/SessionPublicService.md:76-205]()

### Storage Operations (`StoragePublicService` / `SharedStoragePublicService`)

Manages data persistence with embedding-based search:

- **Retrieval**: `take()` for similarity-based search, `get()` for direct access, `list()` for enumeration
- **Modification**: `upsert()` for insert/update, `remove()` for deletion, `clear()` for reset
- **Scope**: Client-specific vs. shared storage instances

Sources: [src/lib/services/public/StoragePublicService.ts:62-420](), [src/lib/services/connection/SharedStorageConnectionService.ts:22-200]()

### State Management (`StatePublicService` / `SharedStatePublicService`)

Provides reactive state management with middleware support:

- **State Operations**: `setState()` with dispatch functions, `getState()` for access, `clearState()` for reset
- **Middleware**: Support for state transformation and validation pipelines
- **Persistence**: Configurable persistence via schema settings

Sources: [src/lib/services/public/StatePublicService.ts:65-150](), [src/lib/services/connection/SharedStateConnectionService.ts:112-180]()

## Performance and Validation

Public Services integrate with several cross-cutting concerns:

### Performance Monitoring

`SessionPublicService` includes `PerfService` integration for execution tracking:

![Mermaid Diagram](./diagrams\17_Public_Services_4.svg)

This tracks execution duration, session state, and performance metrics.

Sources: [docs/classes/SessionPublicService.md:118-125]()

### Validation Services

Public Services coordinate with validation services for integrity checks:

- **Session Validation**: Prevents recursive tool execution and navigation
- **Execution Validation**: Controls model tool calling behavior
- **Navigation Validation**: Manages agent switching constraints

Sources: [docs/classes/SessionPublicService.md:42-74]()

## Integration with Core Components

Public Services serve as the bridge between external applications and the core swarm system:

![Mermaid Diagram](./diagrams\17_Public_Services_5.svg)

This architecture ensures clean separation between external interfaces and internal implementation details while providing comprehensive functionality for multi-agent AI systems.

Sources: [docs/index.md:32-83](), [src/lib/services/public/SwarmPublicService.ts:70-350]()