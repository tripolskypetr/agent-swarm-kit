# Public Services

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



Public Services form the outermost API layer of the swarm system, providing a controlled interface to core functionality while managing execution context and excluding internal implementation details. These services wrap Connection Services with method-level context management, logging, and validation to create a clean separation between public APIs and internal operations.

For information about the underlying Connection Services that Public Services wrap, see [Connection Services](#3.3). For details about the Schema Services that define configurations, see [Schema Services](#3.2).

## Architecture Overview

Public Services implement a consistent pattern that filters internal methods from Connection Services and adds contextual wrapping to all public operations. This creates a controlled API surface while maintaining access to core functionality.

![Mermaid Diagram](./diagrams\16_Public_Services_0.svg)

**Public Service Type Filtering Pattern**

Sources: [src/lib/services/public/SessionPublicService.ts:23-45](), [src/lib/services/public/AgentPublicService.ts:12-34]()

## Core Public Services

### AgentPublicService

`AgentPublicService` provides the public interface for agent operations, excluding internal methods like `getAgent` while exposing execution, disposal, and messaging capabilities.

![Mermaid Diagram](./diagrams\16_Public_Services_1.svg)

**AgentPublicService Method Filtering**

The service implements `TAgentConnectionService` which excludes `getAgent` from the public interface:

| Public Method | Purpose | Context Management |
|---------------|---------|-------------------|
| `createAgentRef` | Creates agent references | MethodContextService scoping |
| `execute` | Executes agent messages | Performance tracking via PerfService |
| `run` | Runs stateless completions | Execution validation |
| `dispose` | Cleans up agent resources | Resource tracking |

Sources: [src/lib/services/public/AgentPublicService.ts:70-91](), [src/lib/services/public/AgentPublicService.ts:22-34]()

### SessionPublicService

`SessionPublicService` manages session-level operations with execution validation and navigation control, wrapping `SessionConnectionService` while excluding internal session management.

![Mermaid Diagram](./diagrams\16_Public_Services_2.svg)

**SessionPublicService Validation Integration**

Key validation integrations include:

- **ExecutionValidationService**: Prevents recursive tool calls and manages execution limits
- **NavigationValidationService**: Controls agent navigation to prevent infinite loops
- **PerfService**: Tracks execution metrics and performance data

Sources: [src/lib/services/public/SessionPublicService.ts:76-102](), [src/lib/services/public/SessionPublicService.ts:124-183]()

## Context Management Integration

Public Services integrate multiple context services to provide comprehensive execution tracking and method scoping.

![Mermaid Diagram](./diagrams\16_Public_Services_3.svg)

**Context Management Flow**

| Context Service | Purpose | Data Tracked |
|----------------|---------|--------------|
| `MethodContextService` | Method-level scoping | clientId, agentName, methodName |
| `ExecutionContextService` | Execution tracking | clientId, executionId, processId |
| `PayloadContextService` | Payload access | Request/response data |
| `SchemaContextService` | Schema overrides | Temporary schema modifications |

Sources: [src/lib/services/public/SessionPublicService.ts:52-103](), [src/lib/services/context/MethodContextService.ts]()

## Performance and Logging Integration

Public Services integrate performance monitoring and logging services to provide comprehensive observability across the API layer.

![Mermaid Diagram](./diagrams\16_Public_Services_4.svg)

**Performance Tracking Example**

Sources: [src/lib/services/public/SessionPublicService.ts:67-68](), [src/lib/services/public/SessionPublicService.ts:184-244]()

## Public Service Catalog

### Core Entity Services

| Service | Purpose | Connection Service | Key Methods |
|---------|---------|-------------------|-------------|
| `AgentPublicService` | Agent operations | `AgentConnectionService` | `execute`, `run`, `dispose` |
| `SessionPublicService` | Session management | `SessionConnectionService` | `connect`, `emit`, `execute` |
| `SwarmPublicService` | Swarm operations | `SwarmConnectionService` | `getAgent`, `navigate`, `emit` |

### Data Services

| Service | Purpose | Connection Service | Key Methods |
|---------|---------|-------------------|-------------|
| `StoragePublicService` | Storage operations | `StorageConnectionService` | `take`, `upsert`, `remove` |
| `StatePublicService` | State management | `StateConnectionService` | `get`, `set`, `clear` |
| `ComputePublicService` | Compute operations | `ComputeConnectionService` | `calculate`, `update` |

### Specialized Services

| Service | Purpose | Connection Service | Key Methods |
|---------|---------|-------------------|-------------|
| `PolicyPublicService` | Policy enforcement | `PolicyConnectionService` | `validate`, `ban`, `unban` |
| `MCPPublicService` | External tool integration | `MCPConnectionService` | `callTool`, `listTools` |
| `HistoryPublicService` | Message history | `HistoryConnectionService` | `push`, `pop`, `flush` |

Sources: [docs/index.md:32-83](), [docs/interfaces/ISwarmDI.md:96-234]()

## Method Wrapping Pattern

Public Services implement a consistent method wrapping pattern that adds context management, validation, and logging to all operations.

![Mermaid Diagram](./diagrams\16_Public_Services_5.svg)

**Method Wrapping Sequence**

The pattern ensures:
- **Context Isolation**: Each method call has isolated context
- **Validation**: Operations are validated before execution
- **Logging**: All operations are logged with context
- **Error Handling**: Consistent error handling and cleanup
- **Performance Tracking**: Execution metrics are captured

Sources: [src/lib/services/public/SessionPublicService.ts:105-140](), [src/lib/services/public/AgentPublicService.ts:70-112]()