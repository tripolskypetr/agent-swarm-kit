---
title: design/12_service_architecture
group: design
---

# Service Architecture

The agent-swarm-kit framework employs a sophisticated layered service architecture built around dependency injection patterns. This document provides an overview of the service organization, layer interactions, and architectural patterns that enable scalable multi-agent orchestration.

For detailed information about the dependency injection container implementation, see [Dependency Injection](./13_Dependency_Injection_Container.md). For specifics about individual service layers, see [Schema Services](./14_Schema_Services.md), [Connection Services](./15_Connection_Services.md), [Public Services](./16_Public_Services.md), and [Validation Services](./17_Validation_Services.md).

## Architecture Overview

The framework organizes services into distinct layers, each with specific responsibilities and clear separation of concerns. This layered approach enables modularity, testability, and maintainable code organization across the entire swarm system.

### Service Layer Structure

The service architecture follows a clear layered pattern where external applications interact with Public Services, which delegate to Connection Services, which coordinate with Schema and Validation Services, all supported by Context and Base Infrastructure services.

![Mermaid Diagram](./diagrams\12_Service_Architecture_0.svg)

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

## Dependency Injection Container

The service architecture is built around a centralized dependency injection container that manages service instantiation, lifecycle, and inter-service dependencies.

### Service Registration and Resolution

The DI container follows a three-phase initialization pattern: service registration via `provide()`, service injection via `inject()`, and container initialization via `init()`.

![Mermaid Diagram](./diagrams\12_Service_Architecture_1.svg)

The `swarm` object exported from the main library serves as the primary dependency injection container, providing access to all registered services through a unified interface defined by `ISwarmDI`. This container aggregates services from all categories into a single, type-safe interface.

### Container Structure

![Mermaid Diagram](./diagrams\12_Service_Architecture_2.svg)

## Service Layer Interactions

### Public to Connection Service Delegation

Public services act as the external API surface, delegating operations to connection services for actual implementation. This pattern provides clean separation between public interfaces and internal resource management.

![Mermaid Diagram](./diagrams\12_Service_Architecture_3.svg)

### Service Delegation Flow in Functions

The high-level functions (`session`, `complete`, `makeConnection`) demonstrate the service delegation pattern by accessing services through the `swarm` container.

![Mermaid Diagram](./diagrams\12_Service_Architecture_4.svg)

### Schema and Validation Integration

Schema services provide configuration data while validation services ensure data integrity and constraint compliance. Connection services coordinate between these layers to maintain system consistency.

![Mermaid Diagram](./diagrams\12_Service_Architecture_5.svg)

## Context Service Architecture

Context services provide execution-scoped data and utilities that span across service boundaries, enabling consistent request tracking and resource management.

### Context Service Hierarchy

![Mermaid Diagram](./diagrams\12_Service_Architecture_6.svg)

### Context Service Integration

Context services integrate with the execution flow through the `beginContext` utility and service-specific `runInContext` methods, providing execution isolation and metadata tracking.

![Mermaid Diagram](./diagrams\12_Service_Architecture_7.svg)

## Base Service Infrastructure

Base services provide foundational capabilities used throughout the system, including logging, event communication, performance monitoring, and system health tracking.

### Base Service Dependencies

![Mermaid Diagram](./diagrams\12_Service_Architecture_8.svg)

The service architecture enables scalable, maintainable multi-agent systems through clear separation of concerns, dependency injection, and layered service organization. Each layer has well-defined responsibilities and interfaces, facilitating testing, debugging, and system evolution.