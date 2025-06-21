---
title: wiki/connection_services
group: wiki
---

# Connection Services

Connection Services form the instance management layer of the agent-swarm-kit architecture, responsible for creating, caching, and managing the lifecycle of component instances. These services act as a bridge between schema definitions and public APIs on one side, and the actual client implementations (`ClientAgent`, `ClientSession`, `ClientStorage`, etc.) on the other side. For information about the public-facing APIs that build on top of connection services, see [Public Services](#3.4). For details about the schema definitions that configure these services, see [Schema Services](#3.2).

## Architecture Overview

Connection Services implement a consistent pattern of instance management using memoization for efficient resource utilization and lifecycle control.

![Mermaid Diagram](./diagrams\16_Connection_Services_0.svg)

Sources: [src/lib/index.ts:101-138](), [src/lib/core/provide.ts:83-96](), [src/model/SwarmDI.model.ts:128-199]()

## Core Patterns

### Memoization and Caching

Connection Services use `functools-kit`'s `memoize` decorator to cache client instances, ensuring efficient resource utilization and preventing redundant instantiation.

![Mermaid Diagram](./diagrams\16_Connection_Services_1.svg)

The memoization pattern is implemented consistently across connection services using composite keys to ensure proper isolation between clients and components.

Sources: [docs/classes/AgentConnectionService.md:125-133](), [docs/classes/SessionConnectionService.md:80-87](), [docs/classes/HistoryConnectionService.md:70-78]()

### Instance Lifecycle Management

Connection Services manage the complete lifecycle of component instances, from creation through disposal, with integration into session validation and resource tracking.

![Mermaid Diagram](./diagrams\16_Connection_Services_2.svg)

Sources: [docs/classes/AgentConnectionService.md:254-263](), [docs/classes/SessionConnectionService.md:209-217](), [src/functions/target/disposeConnection.ts:50-97]()

## Individual Connection Services

### AgentConnectionService

Manages `ClientAgent` instances with dependency injection for history, storage, state, and tool configurations.

Key responsibilities:
- Creates and caches `ClientAgent` instances using `clientId-agentName` composite keys
- Configures agents with schemas from `AgentSchemaService`, `ToolSchemaService`, and `CompletionSchemaService`
- Initializes agent dependencies via `HistoryConnectionService`, `StorageConnectionService`, and `StateConnectionService`
- Integrates with `MCPConnectionService` for external tool access

Sources: [docs/classes/AgentConnectionService.md:10-14](), [docs/classes/AgentConnectionService.md:125-133]()

### SessionConnectionService

Manages `ClientSession` instances that coordinate swarm-level operations and policy enforcement.

Key features:
- Caches `ClientSession` instances using `clientId-swarmName` composite keys  
- Configures sessions with swarm data from `SwarmSchemaService`
- Integrates policies from `PolicyConnectionService` using `MergePolicy` or defaulting to `NoopPolicy`
- Provides swarm access through `SwarmConnectionService`

Sources: [docs/classes/SessionConnectionService.md:10-14](), [docs/classes/SessionConnectionService.md:80-87]()

### HistoryConnectionService

Manages `ClientHistory` instances for conversation history and message persistence.

Implementation details:
- Uses `clientId-agentName` composite keys for history isolation
- Initializes history with items from `GLOBAL_CONFIG.CC_GET_AGENT_HISTORY_ADAPTER`
- Provides message manipulation methods (`push`, `pop`, `toArrayForAgent`, `toArrayForRaw`)
- Integrates with `SessionValidationService` for usage tracking

Sources: [docs/classes/HistoryConnectionService.md:10-14](), [docs/classes/HistoryConnectionService.md:70-78]()

### Storage and State Connection Services

Multiple connection services handle different scopes of data management:

- **StorageConnectionService**: Client-scoped storage instances
- **SharedStorageConnectionService**: Shared storage across clients
- **StateConnectionService**: Client-scoped state management  
- **SharedStateConnectionService**: Shared state across clients
- **ComputeConnectionService**: Client-scoped compute resources
- **SharedComputeConnectionService**: Shared compute resources

![Mermaid Diagram](./diagrams\16_Connection_Services_3.svg)

Sources: [src/lib/index.ts:114-137](), [src/model/SwarmDI.model.ts:153-199]()

## Instance Management Integration

### Dependency Injection Integration

Connection Services are registered in the dependency injection container and accessed through the global `swarm` object.

![Mermaid Diagram](./diagrams\16_Connection_Services_4.svg)

The registration pattern in `provide.ts` creates singleton instances that are injected into public services.

Sources: [src/lib/core/provide.ts:83-96](), [src/lib/index.ts:101-138]()

### Session Validation Integration

Connection Services integrate with `SessionValidationService` to track resource usage and maintain session state.

Key integration points:
- Instance creation registers usage with `SessionValidationService`
- Disposal operations update session tracking
- Validation checks ensure sessions exist before operations
- Resource cleanup coordinates with session disposal

Sources: [docs/classes/AgentConnectionService.md:50-58](), [src/functions/target/disposeConnection.ts:50-97]()

### Context Service Integration

Connection Services work with context services to maintain execution context across operations:

- **MethodContextService**: Provides execution context for retrieving `clientId` and component names
- **ExecutionContextService**: Manages execution-level context with `executionId` and `processId`
- **PayloadContextService**: Handles payload-related context data

This integration enables connection services to operate within scoped execution contexts while maintaining proper resource isolation.

Sources: [docs/classes/AgentConnectionService.md:42-49](), [docs/classes/SessionConnectionService.md:42-49]()