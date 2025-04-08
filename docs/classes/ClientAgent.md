---
title: docs/api-reference/class/ClientAgent
group: docs
---

# ClientAgent

Implements `IAgent`

Represents a client-side agent in the swarm system, implementing the IAgent interface.
Manages message execution, tool calls, history updates, and event emissions, with queued execution to prevent overlap.
Integrates with AgentConnectionService (instantiation), HistoryConnectionService (history), ToolSchemaService (tools), CompletionSchemaService (completions), SwarmConnectionService (swarm coordination), and BusService (events).
Uses Subjects from functools-kit for asynchronous state management (e.g., tool errors, agent changes).

## Constructor

```ts
constructor(params: IAgentParams);
```

## Properties

### params

```ts
params: IAgentParams
```

### _toolAbortController

```ts
_toolAbortController: ToolAbortController
```

An instance of `ToolAbortController` used to manage the lifecycle of abort signals for tool executions.
Provides an `AbortSignal` to signal and handle abort events for asynchronous operations.

This property is used to control and cancel ongoing tool executions when necessary, such as during agent changes or tool stops.

### _agentChangeSubject

```ts
_agentChangeSubject: Subject<unique symbol>
```

Subject for signaling agent changes, halting subsequent tool executions via commitAgentChange.

### _resqueSubject

```ts
_resqueSubject: Subject<unique symbol>
```

Subject for signaling model resurrection events, triggered by _resurrectModel during error recovery.

### _toolErrorSubject

```ts
_toolErrorSubject: Subject<unique symbol>
```

Subject for signaling tool execution errors, emitted by createToolCall on failure.

### _toolStopSubject

```ts
_toolStopSubject: Subject<unique symbol>
```

Subject for signaling tool execution stops, triggered by commitStopTools.

### _toolCommitSubject

```ts
_toolCommitSubject: Subject<void>
```

Subject for signaling tool output commitments, triggered by commitToolOutput.

### _outputSubject

```ts
_outputSubject: Subject<string>
```

Subject for emitting transformed outputs, used by _emitOutput and waitForOutput.

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes the incoming message and processes tool calls if present, queued to prevent overlapping executions.
Implements IAgent.execute, delegating to EXECUTE_FN with queuing via functools-kit’s queued decorator.

### run

```ts
run: (input: string) => Promise<string>
```

Runs a stateless completion for the incoming message, queued to prevent overlapping executions.
Implements IAgent.run, delegating to RUN_FN with queuing via functools-kit’s queued decorator.

## Methods

### _resolveSystemPrompt

```ts
_resolveSystemPrompt(): Promise<string[]>;
```

Resolves the system prompt by combining static and dynamic system messages.
Static messages are directly included from the `systemStatic` parameter, while dynamic messages
are fetched asynchronously using the `systemDynamic` function.

This method is used to construct the system-level context for the agent, which can include
predefined static messages and dynamically generated messages based on the agent's state or configuration.

### _emitOutput

```ts
_emitOutput(mode: ExecutionMode, rawResult: string): Promise<void>;
```

Emits the transformed output after validation, invoking callbacks and emitting events via BusService.
Attempts model resurrection via _resurrectModel if validation fails, throwing an error if unrecoverable.
Supports SwarmConnectionService by broadcasting agent outputs within the swarm.

### _resurrectModel

```ts
_resurrectModel(mode: ExecutionMode, reason?: string): Promise<string>;
```

Resurrects the model in case of failures using configured strategies (flush, recomplete, custom).
Updates history with failure details and returns a placeholder or transformed result, signaling via _resqueSubject.
Supports error recovery for CompletionSchemaService’s getCompletion calls.

### waitForOutput

```ts
waitForOutput(): Promise<string>;
```

Waits for the next output to be emitted via _outputSubject, typically after execute or run.
Useful for external consumers (e.g., SwarmConnectionService) awaiting agent responses.

### getCompletion

```ts
getCompletion(mode: ExecutionMode): Promise<IModelMessage>;
```

Retrieves a completion message from the model using the current history and tools.
Applies validation and resurrection strategies (via _resurrectModel) if needed, integrating with CompletionSchemaService.

### commitUserMessage

```ts
commitUserMessage(message: string, mode: ExecutionMode): Promise<void>;
```

Commits a user message to the history without triggering a response, notifying the system via BusService.
Supports SessionConnectionService by logging user interactions within a session.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits a flush of the agent’s history, clearing it and notifying the system via BusService.
Useful for resetting agent state, coordinated with HistoryConnectionService.

### commitAgentChange

```ts
commitAgentChange(): Promise<void>;
```

Signals an agent change to halt subsequent tool executions, emitting an event via _agentChangeSubject and BusService.
Supports SwarmConnectionService by allowing dynamic agent switching within a swarm.

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Signals a stop to prevent further tool executions, emitting an event via _toolStopSubject and BusService.
Used to interrupt tool call chains, coordinated with ToolSchemaService tools.

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Commits a system message to the history, notifying the system via BusService without triggering execution.
Supports system-level updates, coordinated with SessionConnectionService.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Commits an assistant message to the history without triggering execution, notifying the system via BusService.
Useful for logging assistant responses, coordinated with HistoryConnectionService.

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits tool output to the history, signaling completion via _toolCommitSubject and notifying the system via BusService.
Integrates with ToolSchemaService by linking tool output to tool calls.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the agent, performing cleanup and invoking the onDispose callback.
Logs the disposal if debugging is enabled, supporting AgentConnectionService cleanup.
