# Connection Services

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [docs/classes/ClientCompute.md](docs/classes/ClientCompute.md)
- [docs/classes/DocService.md](docs/classes/DocService.md)
- [docs/classes/SchemaUtils.md](docs/classes/SchemaUtils.md)
- [docs/index.md](docs/index.md)
- [docs/interfaces/IAgentNavigationParams.md](docs/interfaces/IAgentNavigationParams.md)
- [docs/interfaces/IAgentTool.md](docs/interfaces/IAgentTool.md)
- [docs/interfaces/INavigateToAgentParams.md](docs/interfaces/INavigateToAgentParams.md)
- [docs/interfaces/INavigateToTriageParams.md](docs/interfaces/INavigateToTriageParams.md)
- [docs/interfaces/ISwarmDI.md](docs/interfaces/ISwarmDI.md)
- [docs/interfaces/ITriageNavigationParams.md](docs/interfaces/ITriageNavigationParams.md)
- [package-lock.json](package-lock.json)
- [package.json](package.json)
- [src/client/ClientAgent.ts](src/client/ClientAgent.ts)
- [src/client/ClientHistory.ts](src/client/ClientHistory.ts)
- [src/client/ClientSession.ts](src/client/ClientSession.ts)
- [src/config/params.ts](src/config/params.ts)
- [src/index.ts](src/index.ts)
- [src/interfaces/Agent.interface.ts](src/interfaces/Agent.interface.ts)
- [src/interfaces/Session.interface.ts](src/interfaces/Session.interface.ts)
- [src/lib/services/connection/AgentConnectionService.ts](src/lib/services/connection/AgentConnectionService.ts)
- [src/lib/services/connection/SessionConnectionService.ts](src/lib/services/connection/SessionConnectionService.ts)
- [src/lib/services/public/AgentPublicService.ts](src/lib/services/public/AgentPublicService.ts)
- [src/lib/services/public/SessionPublicService.ts](src/lib/services/public/SessionPublicService.ts)
- [src/model/GlobalConfig.model.ts](src/model/GlobalConfig.model.ts)
- [types.d.ts](types.d.ts)

</details>



Connection Services form a critical architectural layer in the agent-swarm-kit that manages the lifecycle and instantiation of core client components. These services act as a bridge between the schema configuration layer and the actual runtime client implementations, providing memoized instances and dependency injection for components like `ClientAgent`, `ClientSession`, `ClientSwarm`, and related storage/state managers.

For information about the public-facing APIs that wrap these connection services, see [Public Services](#3.4). For details about the underlying schema definitions these services consume, see [Schema Services](#3.2).

## Service Architecture Overview

Connection Services sit between the Schema Services and the client implementation layer, providing lifecycle management and instance caching:

![Mermaid Diagram](./diagrams\15_Connection_Services_0.svg)

**Connection Services Architecture**

Sources: [src/lib/services/connection/AgentConnectionService.ts:1-40](), [src/lib/services/connection/SessionConnectionService.ts:1-30](), [types.d.ts:1-50]()

## Core Connection Services

### AgentConnectionService

The `AgentConnectionService` manages `ClientAgent` lifecycle and provides memoized agent instances:

![Mermaid Diagram](./diagrams\15_Connection_Services_1.svg)

**AgentConnectionService Workflow**

The service uses a memoization strategy with composite keys:

| Method | Cache Key | Purpose |
|--------|-----------|---------|
| `getAgent` | `${clientId}-${agentName}` | Creates cached `ClientAgent` instances per client-agent pair |

Sources: [src/lib/services/connection/AgentConnectionService.ts:148-169](), [src/lib/services/connection/AgentConnectionService.ts:196-230]()

### SessionConnectionService 

The `SessionConnectionService` manages `ClientSession` instances with swarm integration:

![Mermaid Diagram](./diagrams\15_Connection_Services_2.svg)

**SessionConnectionService Workflow**

Sources: [src/lib/services/connection/SessionConnectionService.ts:96-115](), [src/client/ClientSession.ts:24-41]()

### SwarmConnectionService

Manages `ClientSwarm` instances and agent navigation within swarms:

| Component | Responsibility |
|-----------|----------------|
| `getSwarm()` | Creates memoized `ClientSwarm` instances per client-swarm pair |
| Navigation tracking | Maintains agent navigation stack via `CC_SWARM_STACK_CHANGED` |
| Agent resolution | Resolves current agent via `CC_SWARM_DEFAULT_AGENT` |

Sources: [src/lib/services/connection/SwarmConnectionService.ts:1-50](), [src/client/ClientSwarm.ts:1-50]()

## Memoization Strategy

Connection Services implement a consistent memoization pattern using `functools-kit`:

![Mermaid Diagram](./diagrams\15_Connection_Services_3.svg)

**Memoization Key Strategy**

Example implementation pattern:
```typescript
public getAgent = memoize(
  ([clientId, agentName]) => `${clientId}-${agentName}`,
  (clientId: string, agentName: string) => {
    // Instance creation logic
  }
);
```

Sources: [src/lib/services/connection/AgentConnectionService.ts:148-150](), [src/lib/services/connection/SessionConnectionService.ts:96-98]()

## Dependency Injection Patterns

Connection Services follow a consistent DI pattern for resource management:

| Service Type | Injection Pattern | Usage |
|--------------|-------------------|-------|
| Schema Services | `inject<AgentSchemaService>(TYPES.agentSchemaService)` | Configuration retrieval |
| Validation Services | `inject<SessionValidationService>(TYPES.sessionValidationService)` | Usage tracking |
| Base Services | `inject<LoggerService>(TYPES.loggerService)` | Logging and events |

![Mermaid Diagram](./diagrams\15_Connection_Services_4.svg)

**Dependency Injection Flow**

Sources: [src/lib/services/connection/AgentConnectionService.ts:39-137](), [src/lib/services/connection/SessionConnectionService.ts:37-85]()

## Storage and State Connection Services

### StorageConnectionService

Manages `ClientStorage` instances with embedding integration:

![Mermaid Diagram](./diagrams\15_Connection_Services_5.svg)

**Storage Connection Workflow**

### StateConnectionService

Manages `ClientState` instances with middleware support:

| Feature | Implementation |
|---------|----------------|
| State caching | Memoized `ClientState` instances per client-state pair |
| Middleware pipeline | Applies `IStateMiddleware` functions during state operations |
| Persistence | Integrates with `CC_DEFAULT_STATE_GET`/`CC_DEFAULT_STATE_SET` |

Sources: [src/lib/services/connection/StorageConnectionService.ts:1-50](), [src/lib/services/connection/StateConnectionService.ts:1-50]()

## Integration with Client Components

Connection Services bridge schema configuration to client implementations:

![Mermaid Diagram](./diagrams\15_Connection_Services_6.svg)

**Service Integration Sequence**

The connection layer ensures:
- **Lifecycle Management**: Proper initialization and disposal of client components
- **Configuration Binding**: Schema data is properly injected into client constructors
- **Resource Efficiency**: Memoization prevents duplicate instance creation
- **Context Propagation**: Client and execution context flows through all layers

Sources: [src/lib/services/connection/AgentConnectionService.ts:174-213](), [src/lib/services/public/AgentPublicService.ts:70-85](), [src/client/ClientAgent.ts:628-650]()