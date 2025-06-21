# Service Architecture

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
- [src/functions/target/complete.ts](src/functions/target/complete.ts)
- [src/functions/target/disposeConnection.ts](src/functions/target/disposeConnection.ts)
- [src/functions/target/makeConnection.ts](src/functions/target/makeConnection.ts)
- [src/functions/target/session.ts](src/functions/target/session.ts)
- [src/lib/core/provide.ts](src/lib/core/provide.ts)
- [src/lib/core/types.ts](src/lib/core/types.ts)
- [src/lib/index.ts](src/lib/index.ts)
- [src/model/SwarmDI.model.ts](src/model/SwarmDI.model.ts)

</details>



The agent-swarm-kit framework employs a sophisticated layered service architecture built around dependency injection patterns. This document provides an overview of the service organization, layer interactions, and architectural patterns that enable scalable multi-agent orchestration.

For detailed information about the dependency injection container implementation, see [Dependency Injection](#3.1). For specifics about individual service layers, see [Schema Services](#3.2), [Connection Services](#3.3), [Public Services](#3.4), and [Validation Services](#3.5).

## Architecture Overview

The framework organizes services into distinct layers, each with specific responsibilities and clear separation of concerns. This layered approach enables modularity, testability, and maintainable code organization across the entire swarm system.

### Service Layer Structure

The service architecture follows a clear layered pattern where external applications interact with Public Services, which delegate to Connection Services, which coordinate with Schema and Validation Services, all supported by Context and Base Infrastructure services.

![Mermaid Diagram](./diagrams\12_Service_Architecture_0.svg)

Sources: [src/lib/index.ts:77-255](), [src/lib/core/provide.ts:67-149](), [src/model/SwarmDI.model.ts:70-453]()

### Service Type Organization

The framework organizes services into six primary categories, each serving distinct architectural purposes:

| Service Category | Purpose | Examples | Service Count |
|-----------------|---------|----------|---------------|
| **Base Services** | Core infrastructure and utilities | `loggerService`, `busService`, `perfService`, `aliveService`, `docService` | 5 |
| **Context Services** | Execution and request context management | `executionContextService`, `methodContextService`, `payloadContextService`, `schemaContextService` | 4 |
| **Schema Services** | Configuration and schema definitions | `agentSchemaService`, `toolSchemaService`, `swarmSchemaService`, `completionSchemaService`, `embeddingSchemaService`, `storageSchemaService`, `stateSchemaService`, `memorySchemaService`, `policySchemaService`, `wikiSchemaService`, `mcpSchemaService`, `computeSchemaService`, `pipelineSchemaService`, `navigationSchemaService` | 14 |
| **Connection Services** | Instance lifecycle and resource management | `agentConnectionService`, `historyConnectionService`, `swarmConnectionService`, `sessionConnectionService`, `storageConnectionService`, `sharedStorageConnectionService`, `stateConnectionService`, `sharedStateConnectionService`, `policyConnectionService`, `mcpConnectionService`, `computeConnectionService`, `sharedComputeConnectionService` | 12 |
| **Public Services** | External API surface | `agentPublicService`, `historyPublicService`, `sessionPublicService`, `swarmPublicService`, `storagePublicService`, `sharedStoragePublicService`, `statePublicService`, `sharedStatePublicService`, `policyPublicService`, `mcpPublicService`, `computePublicService`, `sharedComputePublicService` | 12 |
| **Validation Services** | Data integrity and constraint validation | `agentValidationService`, `toolValidationService`, `sessionValidationService`, `swarmValidationService`, `completionValidationService`, `storageValidationService`, `embeddingValidationService`, `policyValidationService`, `navigationValidationService`, `wikiValidationService`, `mcpValidationService`, `computeValidationService`, `stateValidationService`, `pipelineValidationService`, `executionValidationService` | 15 |
| **Meta Services** | Component metadata management | `agentMetaService`, `swarmMetaService` | 2 |

Sources: [src/lib/core/types.ts:1-96](), [src/model/SwarmDI.model.ts:66-460](), [src/lib/index.ts:78-259]()

## Dependency Injection Container

The service architecture is built around a centralized dependency injection container that manages service instantiation, lifecycle, and inter-service dependencies.

### Service Registration and Resolution

The DI container follows a three-phase initialization pattern: service registration via `provide()`, service injection via `inject()`, and container initialization via `init()`.

![Mermaid Diagram](./diagrams\12_Service_Architecture_1.svg)

Sources: [src/lib/core/di.ts](), [src/lib/core/provide.ts:68-151](), [src/lib/index.ts:251-262](), [src/lib/core/types.ts:1-96]()

The `swarm` object exported from the main library serves as the primary dependency injection container, providing access to all registered services through a unified interface defined by `ISwarmDI`. This container aggregates services from all categories into a single, type-safe interface.

### Container Structure

![Mermaid Diagram](./diagrams\12_Service_Architecture_2.svg)

Sources: [src/model/SwarmDI.model.ts:66-460](), [src/lib/index.ts:251-262]()

## Service Layer Interactions

### Public to Connection Service Delegation

Public services act as the external API surface, delegating operations to connection services for actual implementation. This pattern provides clean separation between public interfaces and internal resource management.

![Mermaid Diagram](./diagrams\12_Service_Architecture_3.svg)

Sources: [src/lib/index.ts:251-259](), [src/lib/core/provide.ts:115-127](), [src/model/SwarmDI.model.ts:288-376]()

### Service Delegation Flow in Functions

The high-level functions (`session`, `complete`, `makeConnection`) demonstrate the service delegation pattern by accessing services through the `swarm` container.

![Mermaid Diagram](./diagrams\12_Service_Architecture_4.svg)

Sources: [src/functions/target/session.ts:33-108](), [src/functions/target/complete.ts:88-156](), [src/functions/target/makeConnection.ts:43-86]()

### Schema and Validation Integration

Schema services provide configuration data while validation services ensure data integrity and constraint compliance. Connection services coordinate between these layers to maintain system consistency.

![Mermaid Diagram](./diagrams\12_Service_Architecture_5.svg)

Sources: [src/lib/core/types.ts:31-84](), [src/lib/index.ts:140-249](), [src/functions/target/disposeConnection.ts:42-190]()

## Context Service Architecture

Context services provide execution-scoped data and utilities that span across service boundaries, enabling consistent request tracking and resource management.

### Context Service Hierarchy

![Mermaid Diagram](./diagrams\12_Service_Architecture_6.svg)

Sources: [src/lib/services/context/MethodContextService.ts](), [src/lib/services/context/ExecutionContextService.ts](), [src/lib/services/context/PayloadContextService.ts](), [src/lib/services/context/SchemaContextService.ts](), [src/functions/target/session.ts:63-96](), [src/functions/target/complete.ts:114-145]()

### Context Service Integration

Context services integrate with the execution flow through the `beginContext` utility and service-specific `runInContext` methods, providing execution isolation and metadata tracking.

![Mermaid Diagram](./diagrams\12_Service_Architecture_7.svg)

Sources: [src/utils/beginContext.ts](), [src/functions/target/session.ts:144-162](), [src/functions/target/complete.ts:148-155]()

## Base Service Infrastructure

Base services provide foundational capabilities used throughout the system, including logging, event communication, performance monitoring, and system health tracking.

### Base Service Dependencies

![Mermaid Diagram](./diagrams\12_Service_Architecture_8.svg)

Sources: [src/lib/services/base/LoggerService.ts](), [src/lib/services/base/BusService.ts](), [src/lib/services/base/PerfService.ts](), [src/lib/services/base/AliveService.ts](), [src/lib/services/base/DocService.ts]()

The service architecture enables scalable, maintainable multi-agent systems through clear separation of concerns, dependency injection, and layered service organization. Each layer has well-defined responsibilities and interfaces, facilitating testing, debugging, and system evolution.