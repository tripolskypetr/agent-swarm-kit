---
title: design/04_client_agent
group: design
---

# Client Agent

This document covers the `ClientAgent` class implementation, which serves as the core execution unit for individual agents within the swarm system. The `ClientAgent` handles message processing, tool execution, history management, and event coordination through an asynchronous, queue-based architecture.

For information about agent configuration and schema definition, see [Agent Schema Services](#3.2). For details on swarm-level coordination and agent orchestration, see [Swarm Management](#2.2). For session-level message handling, see [Session and Chat Management](#2.3).

## Core Architecture

The `ClientAgent` implements the `IAgent` interface and serves as the primary execution engine for individual agents. It coordinates between multiple services and uses reactive programming patterns via `Subject` instances for asynchronous state management.

### ClientAgent Class Structure

![Mermaid Diagram](./diagrams\4_Client_Agent_0.svg)

## Execution Lifecycle

The `ClientAgent` follows a structured execution lifecycle with queued processing to prevent overlapping executions. The system supports both stateful execution (via `execute`) and stateless completion (via `run`).

### Execution Flow Diagram

![Mermaid Diagram](./diagrams\4_Client_Agent_1.svg)

### Queued Execution Pattern

Both `execute` and `run` methods use the `queued` decorator from `functools-kit` to prevent overlapping executions:

```typescript
public execute = queued(EXECUTE_FN);
public run = queued(RUN_FN);
```

This ensures that only one execution can occur at a time per agent instance, maintaining consistency in message processing and tool execution.

## Tool Call Management

The `ClientAgent` handles tool execution through a sophisticated orchestration system that supports validation, error recovery, and asynchronous coordination.

### Tool Resolution and Execution

![Mermaid Diagram](./diagrams\4_Client_Agent_2.svg)

### Tool Abort Controller

The `ClientAgent` uses a `ToolAbortController` to manage cancellation of ongoing tool executions:

```typescript
class ToolAbortController {
  private _abortController: AbortController | null = null;
  
  get signal(): AbortSignal {
    return this._abortController.signal;
  }
  
  abort() {
    this._abortController?.abort();
    this._abortController = new AbortController();
  }
}
```

This controller provides `AbortSignal` instances to tool executions, allowing for graceful cancellation when agent changes or errors occur.

## Message Processing and History

The `ClientAgent` integrates closely with the history system to maintain conversation context and support completion generation.

### Message Flow and History Integration

![Mermaid Diagram](./diagrams\4_Client_Agent_3.svg)

### History Filtering and Context Management

The `ClientAgent` works with `ClientHistory` to maintain appropriate context for completions. The history system applies filtering based on:

- Message roles and types
- Agent-specific message filtering (`CC_AGENT_HISTORY_FILTER`)
- Tool call consistency (linking tool outputs to tool calls)
- Message limits (`keepMessages` parameter)

## Error Recovery and Resurrection

The `ClientAgent` implements a robust error recovery system through the `_resurrectModel` method, which handles various failure scenarios.

### Resurrection Strategies

![Mermaid Diagram](./diagrams\4_Client_Agent_4.svg)

### Error Types and Handling

The system handles several types of errors:

1. **Tool validation failures** - Invalid parameters or missing tools
2. **Tool execution errors** - Runtime errors during tool execution  
3. **Completion failures** - AI model errors or invalid outputs
4. **Output validation failures** - Invalid agent outputs

Each error type triggers appropriate recovery mechanisms and logging.

## Event Coordination via Subjects

The `ClientAgent` uses `Subject` instances from `functools-kit` for asynchronous coordination between different execution phases.

### Subject-Based Coordination System

![Mermaid Diagram](./diagrams\4_Client_Agent_5.svg)

### Asynchronous Tool Execution

The tool execution system uses `Promise.race()` to coordinate between tool completion and various interruption signals:

```typescript
const statusAwaiter = Promise.race([
  self._agentChangeSubject.toPromise(),
  self._toolCommitSubject.toPromise(),
  self._toolErrorSubject.toPromise(),
  self._toolStopSubject.toPromise(),
  self._resqueSubject.toPromise(),
  self._cancelOutputSubject.toPromise(),
]);
```

This allows for responsive cancellation and error handling during tool execution.

## Integration with Services

The `ClientAgent` integrates with multiple services through dependency injection and the service layer architecture.

### Service Dependencies

![Mermaid Diagram](./diagrams\4_Client_Agent_6.svg)

### Lifecycle Management

The `AgentConnectionService` manages `ClientAgent` lifecycle through memoization, ensuring efficient reuse while maintaining proper initialization and disposal:

- **Creation:** Agents are created on-demand and cached by `clientId-agentName` key
- **Initialization:** Dependencies are resolved and injected during creation
- **Disposal:** Resources are cleaned up when agents are no longer needed
