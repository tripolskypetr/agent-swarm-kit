# Client Agent

<details>
<summary>Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [docs/classes/AgentConnectionService.md](docs/classes/AgentConnectionService.md)
- [docs/classes/AgentPublicService.md](docs/classes/AgentPublicService.md)
- [docs/classes/AgentValidationService.md](docs/classes/AgentValidationService.md)
- [docs/classes/ClientAgent.md](docs/classes/ClientAgent.md)
- [docs/classes/ClientOperator.md](docs/classes/ClientOperator.md)
- [docs/classes/ClientSession.md](docs/classes/ClientSession.md)
- [docs/classes/HistoryConnectionService.md](docs/classes/HistoryConnectionService.md)
- [docs/classes/SessionConnectionService.md](docs/classes/SessionConnectionService.md)
- [docs/classes/SessionPublicService.md](docs/classes/SessionPublicService.md)
- [docs/interfaces/IAgent.md](docs/interfaces/IAgent.md)
- [docs/interfaces/IAgentSchema.md](docs/interfaces/IAgentSchema.md)
- [docs/interfaces/IAgentSchemaCallbacks.md](docs/interfaces/IAgentSchemaCallbacks.md)
- [docs/interfaces/ICompletionSchema.md](docs/interfaces/ICompletionSchema.md)
- [docs/interfaces/IGlobalConfig.md](docs/interfaces/IGlobalConfig.md)
- [docs/interfaces/ISession.md](docs/interfaces/ISession.md)
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



This document covers the `ClientAgent` class implementation, which serves as the core execution unit for individual agents within the swarm system. The `ClientAgent` handles message processing, tool execution, history management, and event coordination through an asynchronous, queue-based architecture.

For information about agent configuration and schema definition, see [Agent Schema Services](#3.2). For details on swarm-level coordination and agent orchestration, see [Swarm Management](#2.2). For session-level message handling, see [Session and Chat Management](#2.3).

## Core Architecture

The `ClientAgent` implements the `IAgent` interface and serves as the primary execution engine for individual agents. It coordinates between multiple services and uses reactive programming patterns via `Subject` instances for asynchronous state management.

### ClientAgent Class Structure

![Mermaid Diagram](./diagrams\4_Client_Agent_0.svg)

**Sources:** [src/client/ClientAgent.ts:1-1000](), [src/interfaces/Agent.interface.ts:1-600](), [src/lib/services/connection/AgentConnectionService.ts:1-400]()

## Execution Lifecycle

The `ClientAgent` follows a structured execution lifecycle with queued processing to prevent overlapping executions. The system supports both stateful execution (via `execute`) and stateless completion (via `run`).

### Execution Flow Diagram

![Mermaid Diagram](./diagrams\4_Client_Agent_1.svg)

**Sources:** [src/client/ClientAgent.ts:319-606](), [src/client/ClientAgent.ts:230-308]()

### Queued Execution Pattern

Both `execute` and `run` methods use the `queued` decorator from `functools-kit` to prevent overlapping executions:

```typescript
public execute = queued(EXECUTE_FN);
public run = queued(RUN_FN);
```

This ensures that only one execution can occur at a time per agent instance, maintaining consistency in message processing and tool execution.

**Sources:** [src/client/ClientAgent.ts:750-752]()

## Tool Call Management

The `ClientAgent` handles tool execution through a sophisticated orchestration system that supports validation, error recovery, and asynchronous coordination.

### Tool Resolution and Execution

![Mermaid Diagram](./diagrams\4_Client_Agent_2.svg)

**Sources:** [src/client/ClientAgent.ts:666-703](), [src/client/ClientAgent.ts:109-165]()

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

**Sources:** [src/client/ClientAgent.ts:41-84]()

## Message Processing and History

The `ClientAgent` integrates closely with the history system to maintain conversation context and support completion generation.

### Message Flow and History Integration

![Mermaid Diagram](./diagrams\4_Client_Agent_3.svg)

**Sources:** [src/client/ClientAgent.ts:336-341](), [src/client/ClientHistory.ts:136-243]()

### History Filtering and Context Management

The `ClientAgent` works with `ClientHistory` to maintain appropriate context for completions. The history system applies filtering based on:

- Message roles and types
- Agent-specific message filtering (`CC_AGENT_HISTORY_FILTER`)
- Tool call consistency (linking tool outputs to tool calls)
- Message limits (`keepMessages` parameter)

**Sources:** [src/client/ClientHistory.ts:136-243](), [src/config/params.ts:78-89]()

## Error Recovery and Resurrection

The `ClientAgent` implements a robust error recovery system through the `_resurrectModel` method, which handles various failure scenarios.

### Resurrection Strategies

![Mermaid Diagram](./diagrams\4_Client_Agent_4.svg)

**Sources:** [src/client/ClientAgent.ts:770-830](), [src/config/params.ts:128-129]()

### Error Types and Handling

The system handles several types of errors:

1. **Tool validation failures** - Invalid parameters or missing tools
2. **Tool execution errors** - Runtime errors during tool execution  
3. **Completion failures** - AI model errors or invalid outputs
4. **Output validation failures** - Invalid agent outputs

Each error type triggers appropriate recovery mechanisms and logging.

**Sources:** [src/client/ClientAgent.ts:412-429](), [src/client/ClientAgent.ts:541-558]()

## Event Coordination via Subjects

The `ClientAgent` uses `Subject` instances from `functools-kit` for asynchronous coordination between different execution phases.

### Subject-Based Coordination System

![Mermaid Diagram](./diagrams\4_Client_Agent_5.svg)

**Sources:** [src/client/ClientAgent.ts:717-745](), [src/client/ClientAgent.ts:460-467]()

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

**Sources:** [src/client/ClientAgent.ts:460-467]()

## Integration with Services

The `ClientAgent` integrates with multiple services through dependency injection and the service layer architecture.

### Service Dependencies

![Mermaid Diagram](./diagrams\4_Client_Agent_6.svg)

**Sources:** [src/client/ClientAgent.ts:613-650](), [src/lib/services/connection/AgentConnectionService.ts:148-218]()

### Lifecycle Management

The `AgentConnectionService` manages `ClientAgent` lifecycle through memoization, ensuring efficient reuse while maintaining proper initialization and disposal:

- **Creation:** Agents are created on-demand and cached by `clientId-agentName` key
- **Initialization:** Dependencies are resolved and injected during creation
- **Disposal:** Resources are cleaned up when agents are no longer needed

**Sources:** [src/lib/services/connection/AgentConnectionService.ts:148-218](), [src/lib/services/connection/AgentConnectionService.ts:323-340]()