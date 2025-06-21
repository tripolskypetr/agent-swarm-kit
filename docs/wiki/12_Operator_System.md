---
title: wiki/operator_system
group: wiki
---

# Operator System

The Operator System manages specialized agent types that facilitate communication between agents and external systems or human operators. Unlike standard AI agents that generate responses through completion engines, operators serve as bridges for external input and real-time interaction patterns.

This system enables scenarios where human operators or external systems need to participate directly in agent conversations, providing manual responses or specialized processing that cannot be handled by automated agents. For information about standard AI agents and their completion engines, see [Client Agent](#2.1).

## Architecture Overview

The Operator System consists of three main components that work together to manage external communication channels:

![Mermaid Diagram](./diagrams\12_Operator_System_0.svg)

Sources: [src/client/ClientOperator.ts:1-320](), [src/classes/Operator.ts:1-325](), [src/interfaces/Operator.interface.ts:1-26]()

## Core Components

### ClientOperator

The `ClientOperator` class serves as the primary interface for operator functionality, implementing the `IAgent` interface with specialized behavior for external communication:

![Mermaid Diagram](./diagrams\12_Operator_System_1.svg)

Sources: [src/client/ClientOperator.ts:77-313]()

### OperatorSignal

The `OperatorSignal` class manages the communication channel between the operator and external systems:

| Method | Purpose | Return Type |
|--------|---------|-------------|
| `sendMessage()` | Sends message to external system | `void` |
| `dispose()` | Cleans up signal connection | `Promise<void>` |

The signal system uses the `connectOperator` function from `IOperatorParams` to establish connections and handle message routing.

Sources: [src/client/ClientOperator.ts:23-70]()

### OperatorInstance

The `OperatorInstance` class provides the base implementation for operator instances with lifecycle management:

![Mermaid Diagram](./diagrams\12_Operator_System_2.svg)

Sources: [src/classes/Operator.ts:91-235]()

## Communication Flow

The operator system implements a bidirectional communication pattern between agents and external systems:

![Mermaid Diagram](./diagrams\12_Operator_System_3.svg)

Sources: [src/client/ClientOperator.ts:116-165](), [src/classes/Operator.ts:300-317]()

## Timeout Management

The operator system includes configurable timeout handling to prevent indefinite waiting:

| Configuration | Default Value | Purpose |
|---------------|---------------|---------|
| `OPERATOR_SIGNAL_TIMEOUT` | 90,000ms | Maximum wait time for operator response |
| `CC_ENABLE_OPERATOR_TIMEOUT` | Global config | Enables/disables timeout functionality |
| `OPERATOR_SIGNAL_SYMBOL` | Symbol | Timeout indicator in Promise.race |

The timeout mechanism uses `Promise.race()` to compete between the actual response and a timeout delay, ensuring the system remains responsive even when external operators are unavailable.

Sources: [src/client/ClientOperator.ts:13-17](), [src/client/ClientOperator.ts:144-165]()

## Operator Utilities

The `OperatorUtils` class provides factory and management capabilities for operator instances:

![Mermaid Diagram](./diagrams\12_Operator_System_4.svg)

The system uses memoization to ensure single operator instances per client-agent combination, managed through the key pattern `${clientId}-${agentName}`.

Sources: [src/classes/Operator.ts:260-318]()

## Integration Points

### Agent Interface Compliance

The `ClientOperator` implements the `IAgent` interface but restricts several methods that are not applicable to operator scenarios:

**Supported Methods:**
- `execute()` - Processes input and routes to external system
- `waitForOutput()` - Waits for external response with timeout
- `commitUserMessage()` - Handles user input routing
- `commitAgentChange()` - Manages operator lifecycle during agent transitions
- `dispose()` - Cleanup and resource management

**Restricted Methods:**
- `run()` - Not applicable for operator pattern
- `commitToolOutput()` - Tools not supported in operator mode
- `commitSystemMessage()` - System messages handled externally
- `commitToolRequest()` - Tool execution not supported
- `commitAssistantMessage()` - Assistant responses come from external system

Sources: [src/client/ClientOperator.ts:99-285]()

### Session Integration

Operators integrate with the session management system through the `IOperatorParams` interface, which includes:

| Parameter | Type | Purpose |
|-----------|------|---------|
| `agentName` | `AgentName` | Identifies the operator agent |
| `clientId` | `string` | Client session identifier |
| `logger` | `ILogger` | Logging service integration |
| `bus` | `IBus` | Event bus for system communication |
| `history` | `IHistory` | Message history management |
| `connectOperator` | `Function` | Connection factory function |

Sources: [src/interfaces/Operator.interface.ts:15-23]()

## Error Handling and Logging

The operator system includes comprehensive logging and error handling:

**Debug Logging:**
- Constructor initialization
- Message sending and receiving
- Signal disposal
- Timeout events
- Lifecycle transitions

**Warning Handling:**
- Unsupported method calls
- Timeout occurrences
- Disposal of active connections

All logging is controlled by the `CC_LOGGER_ENABLE_DEBUG` global configuration flag and uses the centralized logging service.

Sources: [src/client/ClientOperator.ts:32-35](), [src/client/ClientOperator.ts:157-160](), [src/classes/Operator.ts:114-118]()