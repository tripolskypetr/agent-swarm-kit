---
title: design/17_validation_serives
group: design
---

# Validation Services

## Purpose and Scope

Validation Services provide runtime validation for agents, sessions, swarms, tools, and their dependencies within the agent-swarm-kit framework. These services ensure data integrity, enforce access control, track resource usage, and validate configurations during system operation. Unlike schema services that define structures, validation services actively enforce rules and maintain system state consistency.

The validation layer consists of 15 specialized services that validate different aspects of the system, from basic configuration validation to complex runtime dependency checking. These services are injected via the dependency injection container and work together to maintain system integrity during agent execution, session management, and resource access.

This document covers the complete validation service architecture, core validation services, runtime enforcement patterns, and integration with other service layers. For schema definition, see [Schema Services](#3.2). For service lifecycle management, see [Connection Services](#3.3).

## Validation Service Architecture

The validation services operate as a coordinated layer within the dependency injection container, providing runtime validation and state tracking for all system components. Each validation service maintains internal state maps and provides memoized validation methods for performance optimization.

### Complete Validation Service Hierarchy

![Mermaid Diagram](./diagrams\17_Validation_Services_0.svg)

**Sources:** [docs/interfaces/ISwarmDI.md:455-587](), [src/lib/services/validation/AgentValidationService.ts:46-90]()

### Validation Service Categories

The 15 validation services are organized into functional categories based on their validation responsibilities:

| Category | Services | Primary Responsibility |
|----------|----------|----------------------|
| **Core Components** | `AgentValidationService`, `SessionValidationService`, `SwarmValidationService`, `ToolValidationService` | Validate fundamental system entities and their configurations |
| **Resources** | `StorageValidationService`, `StateValidationService`, `ComputeValidationService`, `CompletionValidationService` | Validate resource configurations and access permissions |
| **Protocols** | `MCPValidationService`, `WikiValidationService`, `PolicyValidationService`, `EmbeddingValidationService` | Validate protocol compliance and integration configurations |
| **Runtime Flow** | `NavigationValidationService`, `ExecutionValidationService`, `PipelineValidationService` | Prevent recursive calls, validate execution flow, and pipeline integrity |

**Sources:** [docs/interfaces/ISwarmDI.md:455-587]()

## Core Validation Services

The three primary validation services manage the fundamental entities in the swarm system: agents, sessions, and swarms. These services maintain internal state maps and coordinate with each other to ensure system integrity.

### AgentValidationService

The `AgentValidationService` serves as the central coordinator for agent validation, managing agent registrations and their complex interdependencies with tools, completions, storages, wikis, and MCP connections.

#### Agent Validation Internal State

![Mermaid Diagram](./diagrams\17_Validation_Services_1.svg)

**Sources:** [src/lib/services/validation/AgentValidationService.ts:94-107](), [src/lib/services/validation/AgentValidationService.ts:227-312]()

### SessionValidationService  

The `SessionValidationService` manages session lifecycle, tracks resource usage per session, and maintains session-to-swarm mappings. It provides comprehensive session state tracking for agents, storages, states, and compute resources.

#### Session Validation State Management

![Mermaid Diagram](./diagrams\17_Validation_Services_2.svg)

**Sources:** [src/lib/services/validation/SessionValidationService.ts:32-86](), [src/lib/services/validation/SessionValidationService.ts:96-233]()

### SwarmValidationService

The `SwarmValidationService` validates swarm configurations, manages agent lists within swarms, and coordinates with `AgentValidationService` and `PolicyValidationService` to ensure swarm integrity.

#### Swarm Validation Dependencies

![Mermaid Diagram](./diagrams\17_Validation_Services_3.svg)

**Sources:** [src/lib/services/validation/SwarmValidationService.ts:156-180]()

## Runtime Validation Patterns

Validation services provide active runtime enforcement rather than passive schema checking. They validate resource access, prevent recursive operations, and maintain session integrity during agent execution.

### Resource Access Validation

The validation services enforce agent permissions for resource access during runtime operations. When an agent attempts to access storage, state, or other resources, the validation service checks if the agent has declared those resources in its schema.

#### Resource Permission Enforcement

![Mermaid Diagram](./diagrams\17_Validation_Services_4.svg)

**Sources:** [src/lib/services/validation/AgentValidationService.ts:227-243](), [test/spec/storage.test.mjs:98-145]()

#### State Access Validation

![Mermaid Diagram](./diagrams\17_Validation_Services_5.svg)

**Sources:** [src/lib/services/validation/AgentValidationService.ts:298-312](), [test/spec/state.test.mjs:233-272]()

### Recursive Operation Prevention

Runtime validation services like `NavigationValidationService` and `ExecutionValidationService` prevent recursive operations that could cause infinite loops or stack overflow during agent execution.

#### Navigation Recursion Prevention

![Mermaid Diagram](./diagrams\17_Validation_Services_6.svg)

**Sources:** [docs/interfaces/ISwarmDI.md:554-586]()

## Validation Error Patterns and Performance Optimization

Validation services implement consistent error handling patterns and use memoization extensively for performance optimization during runtime validation checks.

### Error Message Structure

Validation errors follow a standardized format that provides detailed context for debugging:

- Component identification: `agent-swarm [component] [entityName] not found`
- Source context: `source=[operation-context]` 
- Specific validation failure details
- Entity relationships and dependencies

#### Common Validation Error Patterns

| Error Type | Pattern | Example |
|------------|---------|---------|
| **Existence** | `agent-swarm [type] [name] not found source=[source]` | `agent-swarm agent chatAgent not found source=swarm-init` |
| **Permission** | `agent-swarm [type] [name] not exist ([operation])` | `agent-swarm agent myAgent not exist (hasStorage)` |
| **Duplicate** | `agent-swarm [type] [name] already exist` | `agent-swarm session clientId=abc123 already exist` |
| **Dependency** | `agent-swarm [type] [name] [dependency] not in [list]` | `agent-swarm swarm mySwarm default agent not in agent list` |

**Sources:** [src/lib/services/validation/AgentValidationService.ts:331-335](), [src/lib/services/validation/SessionValidationService.ts:509-517](), [src/lib/services/validation/SwarmValidationService.ts:168-172]()

### Performance Optimization with Memoization

Validation services use `memoize` from `functools-kit` to optimize frequently called validation methods. This is crucial for runtime performance since validation checks occur during every resource access.

#### Memoized Validation Methods

![Mermaid Diagram](./diagrams\17_Validation_Services_7.svg)

**Sources:** [src/lib/services/validation/AgentValidationService.ts:227-243](), [src/lib/services/validation/SwarmValidationService.ts:103-116](), [src/lib/services/validation/SessionValidationService.ts:501-519]()

## Runtime Validation Integration

Validation services are actively used during runtime operations to ensure system integrity. The framework validates agent permissions before allowing access to resources.

### Runtime Validation Examples

Test cases demonstrate the validation enforcement in action:

![Mermaid Diagram](./diagrams\17_Validation_Services_8.svg)

**Sources:** [test/spec/storage.test.mjs:98-145](), [test/spec/state.test.mjs:233-272]()

## Performance Optimization

Validation services use memoization extensively to optimize repeated validation checks, particularly important for resource association queries that may be called frequently during agent execution.

The `memoize` decorator from `functools-kit` is applied to methods like:
- `hasStorage()` - memoized by `${agentName}-${storageName}`
- `hasState()` - memoized by `${agentName}-${stateName}`
- `hasDependency()` - memoized by `${targetAgentName}-${depAgentName}`
- `validate()` - memoized by `agentName`

**Sources:** [src/lib/services/validation/AgentValidationService.ts:227-243](), [src/lib/services/validation/AgentValidationService.ts:322-380]()