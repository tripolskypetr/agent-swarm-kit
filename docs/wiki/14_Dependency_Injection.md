---
title: wiki/dependency_injection
group: wiki
---

# Dependency Injection

This document explains the dependency injection (DI) system used in agent-swarm-kit, which forms the architectural backbone of the entire framework. The DI system provides service management, component lifecycle handling, and a clean separation of concerns that enables the multi-agent architecture to function effectively.

The core of the system is the `swarm` object exported from the main library, which provides access to all registered services through a single interface.

For information about specific services and their implementations, see [Core Components](#2).

## Purpose and Overview

Agent-swarm-kit uses dependency injection to:

1. Manage service lifecycle and instantiation through the `ISwarmDI` interface
2. Provide a modular architecture where components can be easily replaced or mocked
3. Support scoped context execution for safe concurrent operations
4. Enable clean separation between public APIs and internal implementations
5. Facilitate testing through service substitution

The framework uses a custom DI implementation built around the `inject`, `provide`, and `init` functions from the core DI module. All services are registered at startup and accessed through the central `swarm` object.

Sources: [src/lib/index.ts:252-262](), [src/lib/core/di.ts](), [src/model/SwarmDI.model.ts:66-460]()

## The Swarm Object and Service Registry

### Central Service Registry Architecture

![Mermaid Diagram](./diagrams\14_Dependency_Injection_0.svg)

Sources: [src/lib/index.ts:78-260](), [src/model/SwarmDI.model.ts:71-460]()

### Service Registration Process

![Mermaid Diagram](./diagrams\14_Dependency_Injection_1.svg)

Sources: [src/lib/core/provide.ts:68-151](), [src/lib/index.ts:78-262](), [src/lib/core/types.ts:1-96]()

## Service Categories

The DI container in agent-swarm-kit organizes services into seven distinct categories, with each service accessible through the `swarm` object:

### Base Services (5 services)

Core utilities that provide fundamental capabilities:
- `swarm.docService`: Documentation generation and retrieval
- `swarm.busService`: Event-driven communication across components
- `swarm.perfService`: Performance monitoring and metrics tracking
- `swarm.aliveService`: System health and liveness monitoring
- `swarm.loggerService`: Centralized logging with debug capabilities

### Context Services (4 services)

Services that manage execution context and scoped data:
- `swarm.methodContextService`: Method-level execution context tracking
- `swarm.payloadContextService`: Payload data encapsulation and access
- `swarm.executionContextService`: Execution flow context with `clientId`, `executionId`, `processId`
- `swarm.schemaContextService`: Schema overrides for pipeline execution

### Schema Services (12 services)

Define configurations and metadata for system components:
- `swarm.agentSchemaService`: Agent definitions and configurations
- `swarm.swarmSchemaService`: Swarm orchestration definitions
- `swarm.toolSchemaService`: Tool function definitions
- `swarm.completionSchemaService`: AI model completion configurations
- `swarm.embeddingSchemaService`: Text embedding configurations
- `swarm.storageSchemaService`: Storage system configurations
- `swarm.stateSchemaService`: State management configurations
- `swarm.memorySchemaService`: Session memory structures
- `swarm.policySchemaService`: Policy and rule definitions
- `swarm.mcpSchemaService`: Model Context Protocol configurations
- `swarm.computeSchemaService`: Compute resource definitions
- `swarm.pipelineSchemaService`: Pipeline workflow definitions
- `swarm.navigationSchemaService`: Agent navigation configurations
- `swarm.wikiSchemaService`: Agent documentation structures

### Connection Services (8 services)

Handle direct operations and lifecycle management:
- `swarm.agentConnectionService`: Agent instance management and execution
- `swarm.sessionConnectionService`: Client session lifecycle management
- `swarm.swarmConnectionService`: Swarm orchestration and navigation
- `swarm.storageConnectionService`: Client-specific storage operations
- `swarm.stateConnectionService`: Client-specific state management
- `swarm.mcpConnectionService`: MCP tool and resource management
- `swarm.computeConnectionService`: Compute resource lifecycle
- `swarm.sharedStorageConnectionService`, `swarm.sharedStateConnectionService`, `swarm.sharedComputeConnectionService`: Shared resource variants

### Public Services (10 services)

Provide the public API layer with context management and validation:
- `swarm.agentPublicService`: Agent execution and management API
- `swarm.sessionPublicService`: Session management and communication API
- `swarm.swarmPublicService`: Swarm orchestration and navigation API
- `swarm.storagePublicService`: Storage operations API
- `swarm.statePublicService`: State management API
- `swarm.mcpPublicService`: MCP operations API
- `swarm.computePublicService`: Compute operations API
- `swarm.policyPublicService`: Policy enforcement API
- `swarm.historyPublicService`: Message history management API
- Shared variants: `swarm.sharedStoragePublicService`, `swarm.sharedStatePublicService`, `swarm.sharedComputePublicService`

### Meta Services (2 services)

Manage metadata and introspection:
- `swarm.agentMetaService`: Agent metadata tracking
- `swarm.swarmMetaService`: Swarm metadata tracking

### Validation Services (15 services)

Enforce rules, constraints, and system integrity:
- `swarm.agentValidationService`: Agent operation validation
- `swarm.sessionValidationService`: Session lifecycle validation
- `swarm.swarmValidationService`: Swarm configuration validation
- `swarm.toolValidationService`: Tool parameter validation
- `swarm.storageValidationService`: Storage operation validation
- `swarm.stateValidationService`: State management validation
- `swarm.mcpValidationService`: MCP operation validation
- `swarm.computeValidationService`: Compute resource validation
- `swarm.policyValidationService`: Policy enforcement validation
- `swarm.completionValidationService`: AI completion validation
- `swarm.embeddingValidationService`: Embedding operation validation
- `swarm.navigationValidationService`: Agent navigation validation
- `swarm.wikiValidationService`: Documentation validation
- `swarm.pipelineValidationService`: Pipeline execution validation
- `swarm.executionValidationService`: Execution context validation

Sources: [src/lib/index.ts:78-249](), [src/lib/core/types.ts:1-84](), [src/lib/core/provide.ts:68-151](), [src/model/SwarmDI.model.ts:71-460]()

## Symbol-Based Service Registration

Services are identified by unique symbols defined in `TYPES` and registered with the DI container through the `provide` function:

### Service Registration Flow

![Mermaid Diagram](./diagrams\14_Dependency_Injection_2.svg)

### Symbol Definitions and Registration

The `TYPES` object contains symbols for all service categories:

```typescript
// Base services symbols
const baseServices = {
    busService: Symbol('busService'),
    docService: Symbol('docService'),
    perfService: Symbol('perfService'),
    aliveService: Symbol('aliveService'),
    loggerService: Symbol('loggerService'),
};

// Registration in provide.ts
{
    provide(TYPES.docService, () => new DocService());
    provide(TYPES.busService, () => new BusService());
    provide(TYPES.perfService, () => new PerfService());
    provide(TYPES.aliveService, () => new AliveService());
    provide(TYPES.loggerService, () => new LoggerService());
}
```

The registration process uses factory functions to create service instances, ensuring proper initialization and lifecycle management.

Sources: [src/lib/core/types.ts:1-96](), [src/lib/core/provide.ts:68-151](), [src/lib/index.ts:78-260]()

## Public and Connection Services Pattern

Agent-swarm-kit uses a two-layer service pattern:

1. **Connection Services**: Implement core interfaces and manage component lifecycles
2. **Public Services**: Wrap connection services, adding context management, validation, and logging

This separation allows internal services to focus on implementation details while public services handle cross-cutting concerns.

### Connection Service Example

```typescript
export class AgentConnectionService implements IAgent {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly busService = inject<BusService>(TYPES.busService);
  private readonly methodContextService = inject<TMethodContextService>(
    TYPES.methodContextService
  );
  // Other injected dependencies...

  public getAgent = memoize(
    ([clientId, agentName]) => `${clientId}-${agentName}`,
    (clientId: string, agentName: string) => {
      // Agent creation logic
    }
  );

  public execute = async (input: string, mode: ExecutionMode) => {
    // Direct execution logic
  };
}
```

### Public Service Example

```typescript
export class AgentPublicService implements TAgentConnectionService {
  private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  private readonly agentConnectionService = inject<AgentConnectionService>(
    TYPES.agentConnectionService
  );

  public execute = async (
    methodName: string,
    clientId: string,
    agentName: AgentName,
    input: string,
    mode: ExecutionMode
  ) => {
    // Logging and validation
    return await MethodContextService.runInContext(
      async () => {
        // Call the underlying connection service
        return await this.agentConnectionService.execute(input, mode);
      },
      {
        methodName,
        clientId,
        agentName,
        // Other context properties
      }
    );
  };
}
```

Sources: [src/lib/services/connection/AgentConnectionService.ts:31-217](), [src/lib/services/public/AgentPublicService.ts:41-129](), [src/lib/services/connection/SessionConnectionService.ts:29-124](), [src/lib/services/public/SessionPublicService.ts:51-104]()

## Service Dependencies and Injection

![Mermaid Diagram](./diagrams\14_Dependency_Injection_3.svg)

Services inject their dependencies using the `inject` function with symbols from `TYPES`. This creates a clear dependency graph and enables service mocking for testing.

Services typically follow these patterns:
1. Inject dependencies in the class properties
2. Use dependencies to implement service functionality
3. Expose public methods that align with their respective interface
4. Add service-specific optimizations (like memoization)

Sources: [src/lib/services/connection/AgentConnectionService.ts:31-136](), [src/lib/services/public/AgentPublicService.ts:41-49](), [src/lib/services/connection/SessionConnectionService.ts:29-73](), [src/lib/services/public/SessionPublicService.ts:51-84]()

## Context Management

Agent-swarm-kit uses three context services to manage the execution environment:

### Method Context

Tracks information about the current method execution, including:
- `methodName`: Current method being executed
- `clientId`: Current client ID
- `agentName`: Current agent name
- `swarmName`: Current swarm name
- And other context properties

Public services wrap each method call with `MethodContextService.runInContext()` to ensure proper context is maintained.

### Execution Context

Manages a global execution context for tracking operations across the system, particularly for performance monitoring and event tracking.

### Payload Context

Stores additional data that needs to be accessed across method boundaries, enabling data sharing without explicit parameter passing.

![Mermaid Diagram](./diagrams\14_Dependency_Injection_4.svg)

Sources: [src/lib/services/public/SessionPublicService.ts:117-131](), [src/lib/services/public/AgentPublicService.ts:124-143](), [src/lib/index.ts:72-82]()

## Entry Points and Usage

The DI system is accessed through several main entry points:

### makeConnection

```typescript
export const makeConnection = beginContext(
  async (connector: ReceiveMessageFn, clientId = randomString(), swarmName: SwarmName) => {
    // Use services from the DI container via 'swarm'
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    
    // Call methods on public services
    const send = swarm.sessionPublicService.connect(
      connector, METHOD_NAME, clientId, swarmName
    );
    
    // Return function that uses services internally
    return async (outgoing) => {
      // ...additional service usage
    };
  }
);
```

### session

```typescript
export const session = beginContext(
  async (clientId = randomString(), swarmName: SwarmName, config = {}) => {
    // Use services from the DI container
    swarm.swarmValidationService.validate(swarmName, METHOD_NAME);
    
    // Return object with methods that use services
    return {
      complete: queued(async (content) => {
        return await swarm.sessionPublicService.execute(
          content, "user", METHOD_NAME, clientId, swarmName
        );
      }),
      dispose: async () => {
        await disposeConnection(clientId, swarmName, METHOD_NAME);
      }
    };
  }
);
```

### disposeConnection

```typescript
export const disposeConnection = beginContext(
  async (clientId: string, swarmName: SwarmName, methodName = METHOD_NAME) => {
    // Dispose resources using public services
    await swarm.sessionPublicService.dispose(methodName, clientId, swarmName);
    await swarm.swarmPublicService.dispose(methodName, clientId, swarmName);
    
    // Clean up other resources
    // ...
  }
);
```

These entry points provide a client-friendly API that internally leverages the DI system for service access and lifecycle management.

Sources: [src/functions/target/makeConnection.ts:43-85](), [src/functions/target/session.ts:42-165](), [src/functions/target/disposeConnection.ts:33-136](), [src/functions/target/complete.ts:46-67]()

## Benefits of the DI System

1. **Modularity**: Services can be added, replaced, or mocked without modifying client code
2. **Testability**: Dependencies can be mocked for isolated testing
3. **Context Management**: Execution context is safely maintained across method boundaries
4. **Separation of Concerns**: Public services handle cross-cutting concerns while connection services focus on implementation
5. **Resource Management**: Service lifecycle and dependency resolution are handled automatically

## Service Registry Summary

| Category | Count | Purpose | Key Services | Access Pattern |
|----------|-------|---------|--------------|----------------|
| Base Services | 5 | Core utilities and infrastructure | `swarm.loggerService`, `swarm.busService`, `swarm.perfService` | Used by all other services |
| Context Services | 4 | Execution context and scoping | `swarm.methodContextService`, `swarm.executionContextService` | Used by public services for context management |
| Schema Services | 12 | Component configuration and metadata | `swarm.agentSchemaService`, `swarm.swarmSchemaService` | Used by connection services for configuration |
| Connection Services | 8 | Direct component operations | `swarm.agentConnectionService`, `swarm.sessionConnectionService` | Used by public services for implementation |
| Public Services | 10 | External API with validation | `swarm.agentPublicService`, `swarm.sessionPublicService` | Used by entry point functions |
| Meta Services | 2 | Metadata and introspection | `swarm.agentMetaService`, `swarm.swarmMetaService` | Used for system introspection |
| Validation Services | 15 | Rule enforcement and integrity | `swarm.agentValidationService`, `swarm.sessionValidationService` | Used by public services and entry points |

### Service Access Patterns

All services are accessed through the `swarm` object, which implements the `ISwarmDI` interface:

```typescript
// Direct service access
swarm.loggerService.log(METHOD_NAME, data);
swarm.sessionValidationService.validate(clientId, methodName);

// Service injection within other services
const loggerService = inject<LoggerService>(TYPES.loggerService);
const busService = inject<BusService>(TYPES.busService);
```

Sources: [src/lib/index.ts:78-260](), [src/lib/core/types.ts:1-96](), [src/model/SwarmDI.model.ts:71-460]()

## Summary

The dependency injection system in agent-swarm-kit provides a solid foundation for building complex multi-agent systems. By organizing services into distinct categories with clear responsibilities and dependencies, the framework achieves a high degree of modularity, testability, and maintainability. The two-layer service pattern (connection and public services) ensures proper separation of concerns, while context management enables safe concurrent execution.

This architecture allows developer-friendly entry points like `makeConnection`, `session`, and `complete` to provide a simple API while leveraging the full power of the underlying service infrastructure.