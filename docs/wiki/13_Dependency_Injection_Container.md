---
title: design/13_dependency_injection_container
group: design
---

# Dependency Injection Container

The dependency injection (DI) container is the central architectural component that manages service lifecycle and provides structured access to all system functionality. It aggregates services across multiple layers - from core infrastructure to public APIs - enabling clean separation of concerns and testable code architecture.

This document covers the central `swarm` DI container object, service registration patterns, and the layered service architecture. For information about individual service categories, see [Schema Services](./14_Schema_Services.md), [Connection Services](./15_Connection_Services.md), [Public Services](./16_Public_Services.md), and [Validation Services](./17_Validation_Services.md).

## Container Architecture

The DI container follows a layered architecture with the `swarm` object serving as the central service registry. All system components access dependencies through this container rather than direct instantiation.

![Mermaid Diagram](./diagrams\13_Dependency_Injection_Container_0.svg)

## Service Registration System

The DI system uses a symbol-based registration approach where each service type has a unique symbol identifier. Services are registered during module initialization using the `provide` function.

### Registration Flow

![Mermaid Diagram](./diagrams\13_Dependency_Injection_Container_1.svg)

The registration process occurs in [src/lib/core/provide.ts:68-151]() with services organized by category:

| Category | Registration Block | Service Count |
|----------|-------------------|---------------|
| Base Services | Lines 69-74 | 5 services |
| Context Services | Lines 77-81 | 4 services |
| Connection Services | Lines 84-96 | 12 services |
| Schema Services | Lines 99-113 | 14 services |
| Public Services | Lines 116-128 | 12 services |
| Meta Services | Lines 131-133 | 2 services |
| Validation Services | Lines 136-151 | 15 services |

## Central swarm Container

The `swarm` object exported from the main module serves as the primary DI container, implementing the `ISwarmDI` interface. It provides structured access to all system services through property-based injection.

![Mermaid Diagram](./diagrams\13_Dependency_Injection_Container_2.svg)

The container assembly occurs in [src/lib/index.ts:252-260]() using spread operators to merge service categories:

```typescript
export const swarm: ISwarmDI = {
  ...baseServices,
  ...contextServices, 
  ...connectionServices,
  ...schemaServices,
  ...publicServices,
  ...metaServices,
  ...validationServices,
};
```

## Service Layer Architecture

The DI container organizes services into distinct layers that correspond to different architectural concerns:

![Mermaid Diagram](./diagrams\13_Dependency_Injection_Container_3.svg)

### Service Dependencies

Services within the container follow a dependency hierarchy where higher-level services depend on lower-level ones:

| Service Type | Dependencies | Purpose |
|--------------|-------------|---------|
| Public Services | Connection + Context Services | External API endpoints |
| Connection Services | Schema + Validation Services | Resource lifecycle management |
| Schema Services | Base Services | Configuration and metadata storage |
| Validation Services | Schema Services | Runtime validation and integrity checks |
| Context Services | Base Services | Execution context management |
| Base Services | None | Core infrastructure |

## Usage Patterns

### Service Access Pattern

Components access services through the central `swarm` container using direct property access:

```typescript
// From disposeConnection function
swarm.sessionValidationService.validate(clientId, methodName);
swarm.swarmValidationService.validate(swarmName, methodName);
await swarm.sessionPublicService.dispose(methodName, clientId, swarmName);
```

### Context-Aware Service Usage

Many services integrate with context services for execution tracking and payload management:

```typescript  
// From session function
swarm.perfService.startExecution(executionId, clientId, content.length);
swarm.busService.commitExecutionBegin(clientId, { swarmName });
const result = await swarm.sessionPublicService.execute(content, "user", METHOD_NAME, clientId, swarmName);
```

### Service Lifecycle Management

The DI container handles service lifecycle through disposal patterns implemented in connection functions like [src/functions/target/disposeConnection.ts:33-191]():

![Mermaid Diagram](./diagrams\13_Dependency_Injection_Container_4.svg)

## Container Initialization

The DI container initializes through a two-phase process:

1. **Service Registration**: [src/lib/core/provide.ts:68-151]() registers all service factories
2. **Container Assembly**: [src/lib/index.ts:252-260]() creates the unified container object
3. **Initialization**: [src/lib/index.ts:262]() calls `init()` to complete setup

The container becomes available as both a default export and named export, enabling flexible import patterns across the codebase.
