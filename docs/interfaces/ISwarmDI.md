---
title: docs/api-reference/interface/ISwarmDI
group: docs
---

# ISwarmDI

Interface defining the structure of the dependency injection container for the swarm system.
Aggregates all services providing core functionality, context management, connectivity, schema definitions,
public APIs, metadata, and validation for the swarm system.

## Properties

### docService

```ts
docService: DocService
```

Service for managing documentation generation and retrieval within the swarm system.
Integrates with `DocService` to provide system-wide documentation capabilities.

### busService

```ts
busService: BusService
```

Service for event-driven communication across the swarm system.
Implements `IBus` to dispatch events like "run" or "emit-output" to clients via `bus.emit`.

### perfService

```ts
perfService: PerfService
```

Service for monitoring and recording performance metrics in the swarm system.
Tracks execution times and resource usage, e.g., via `startExecution` in `PerfService`.

### aliveService

```ts
aliveService: AliveService
```

Service for tracking the liveness and health of swarm components.
Ensures system components remain operational, integrating with persistence layers like `PersistAlive`.

### loggerService

```ts
loggerService: LoggerService
```

Service for logging system events and debugging information.
Implements `ILogger` to provide log, debug, and info-level logging across components.

### methodContextService

```ts
methodContextService: { readonly context: IMethodContext; }
```

Service for managing method-level execution context.
Tracks invocation metadata, scoped via `MethodContextService` for debugging and tracing.

### payloadContextService

```ts
payloadContextService: { readonly context: IPayloadContext<object>; }
```

Service for encapsulating payload-related context data.
Implements `IPayloadContext` to provide execution metadata and payload access via `PayloadContextService`.

### executionContextService

```ts
executionContextService: { readonly context: IExecutionContext; }
```

Service for managing execution-level context across the swarm system.
Implements `IExecutionContext` to track `clientId`, `executionId`, and `processId` via `ExecutionContextService`.

### agentConnectionService

```ts
agentConnectionService: AgentConnectionService
```

Service for managing agent connections within the swarm.
Handles lifecycle events like `makeConnection` and `disposeConnection` for agents.

### historyConnectionService

```ts
historyConnectionService: HistoryConnectionService
```

Service for managing history connections and persistence.
Integrates with `IHistory` to connect and store historical data via `HistoryConnectionService`.

### swarmConnectionService

```ts
swarmConnectionService: SwarmConnectionService
```

Service for managing swarm-level connections.
Facilitates swarm lifecycle operations like agent navigation via `SwarmConnectionService`.

### sessionConnectionService

```ts
sessionConnectionService: SessionConnectionService
```

Service for managing client session connections.
Implements `ISession` connectivity via `SessionConnectionService` for client interactions.

### storageConnectionService

```ts
storageConnectionService: StorageConnectionService
```

Service for managing storage connections within the swarm.
Handles `IStorage` connectivity and persistence via `StorageConnectionService`.

### sharedStorageConnectionService

```ts
sharedStorageConnectionService: SharedStorageConnectionService
```

Service for managing shared storage connections across agents.
Provides shared `IStorage` access via `SharedStorageConnectionService`.

### stateConnectionService

```ts
stateConnectionService: StateConnectionService<any>
```

Service for managing state connections within the swarm.
Handles `IState` connectivity and persistence via `StateConnectionService`.

### sharedStateConnectionService

```ts
sharedStateConnectionService: SharedStateConnectionService<any>
```

Service for managing shared state connections across agents.
Provides shared `IState` access via `SharedStateConnectionService`.

### policyConnectionService

```ts
policyConnectionService: PolicyConnectionService
```

Service for managing policy connections within the swarm.
Handles `IPolicy` connectivity and enforcement via `PolicyConnectionService`.

### agentSchemaService

```ts
agentSchemaService: AgentSchemaService
```

Service for defining and managing agent schemas.
Implements `IAgentSchema` to configure agent behavior via `AgentSchemaService`.

### toolSchemaService

```ts
toolSchemaService: ToolSchemaService
```

Service for defining and managing tool schemas.
Configures `ITool` structures for agent use via `ToolSchemaService`.

### swarmSchemaService

```ts
swarmSchemaService: SwarmSchemaService
```

Service for defining and managing swarm schemas.
Implements `ISwarmSchema` to configure swarm behavior via `SwarmSchemaService`.

### completionSchemaService

```ts
completionSchemaService: CompletionSchemaService
```

Service for defining and managing completion schemas.
Configures `ICompletionSchema` for AI model interactions via `CompletionSchemaService`.

### embeddingSchemaService

```ts
embeddingSchemaService: EmbeddingSchemaService
```

Service for defining and managing embedding schemas.
Implements `IEmbeddingSchema` for text encoding via `EmbeddingSchemaService`.

### storageSchemaService

```ts
storageSchemaService: StorageSchemaService
```

Service for defining and managing storage schemas.
Implements `IStorageSchema` for data persistence via `StorageSchemaService`.

### stateSchemaService

```ts
stateSchemaService: StateSchemaService
```

Service for defining and managing state schemas.
Implements `IStateSchema` for state management via `StateSchemaService`.

### memorySchemaService

```ts
memorySchemaService: MemorySchemaService
```

Service for defining and managing memory schemas.
Handles session memory structures via `MemorySchemaService` for client state persistence.

### policySchemaService

```ts
policySchemaService: PolicySchemaService
```

Service for defining and managing policy schemas.
Implements `IPolicySchema` for rule enforcement via `PolicySchemaService`.

### agentPublicService

```ts
agentPublicService: AgentPublicService
```

Service exposing public APIs for agent operations.
Provides methods like `execute` and `runStateless` via `AgentPublicService`.

### historyPublicService

```ts
historyPublicService: HistoryPublicService
```

Service exposing public APIs for historical data management.
Implements `IHistory` operations like `push` via `HistoryPublicService`.

### sessionPublicService

```ts
sessionPublicService: SessionPublicService
```

Service exposing public APIs for session management.
Provides session lifecycle methods via `SessionPublicService`.

### swarmPublicService

```ts
swarmPublicService: SwarmPublicService
```

Service exposing public APIs for swarm operations.
Handles swarm navigation and management via `SwarmPublicService`.

### storagePublicService

```ts
storagePublicService: StoragePublicService
```

Service exposing public APIs for storage operations.
Implements `IStorage` methods like `upsert` and `take` via `StoragePublicService`.

### sharedStoragePublicService

```ts
sharedStoragePublicService: SharedStoragePublicService
```

Service exposing public APIs for shared storage operations.
Provides shared `IStorage` access via `SharedStoragePublicService`.

### statePublicService

```ts
statePublicService: StatePublicService<any>
```

Service exposing public APIs for state operations.
Implements `IState` methods like `getState` and `setState` via `StatePublicService`.

### sharedStatePublicService

```ts
sharedStatePublicService: SharedStatePublicService<any>
```

Service exposing public APIs for shared state operations.
Provides shared `IState` access via `SharedStatePublicService`.

### policyPublicService

```ts
policyPublicService: PolicyPublicService
```

Service exposing public APIs for policy operations.
Implements `IPolicy` methods like `banClient` via `PolicyPublicService`.

### agentMetaService

```ts
agentMetaService: AgentMetaService
```

Service managing metadata for agents.
Tracks agent-specific metadata via `AgentMetaService`.

### swarmMetaService

```ts
swarmMetaService: SwarmMetaService
```

Service managing metadata for swarms.
Tracks swarm-specific metadata via `SwarmMetaService`.

### agentValidationService

```ts
agentValidationService: AgentValidationService
```

Service validating agent-related data and configurations.
Ensures agent integrity via `AgentValidationService`.

### toolValidationService

```ts
toolValidationService: ToolValidationService
```

Service validating tool-related data and parameters.
Ensures tool correctness via `ToolValidationService`.

### sessionValidationService

```ts
sessionValidationService: SessionValidationService
```

Service validating session-related data and connectivity.
Ensures session validity via `SessionValidationService`.

### swarmValidationService

```ts
swarmValidationService: SwarmValidationService
```

Service validating swarm-related data and configurations.
Ensures swarm integrity via `SwarmValidationService`.

### completionValidationService

```ts
completionValidationService: CompletionValidationService
```

Service validating completion-related data and responses.
Ensures completion integrity via `CompletionValidationService`.

### storageValidationService

```ts
storageValidationService: StorageValidationService
```

Service validating storage-related data and operations.
Ensures storage integrity via `StorageValidationService`.

### embeddingValidationService

```ts
embeddingValidationService: EmbeddingValidationService
```

Service validating embedding-related data and configurations.
Ensures embedding integrity via `EmbeddingValidationService`.

### policyValidationService

```ts
policyValidationService: PolicyValidationService
```

Service validating policy-related data and enforcement rules.
Ensures policy integrity via `PolicyValidationService`.
