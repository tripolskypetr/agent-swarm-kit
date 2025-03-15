# ClientAgent

Implements `IAgent`

Represents a client agent that interacts with the system, managing message execution, tool calls, and history.

## Constructor

```ts
constructor(params: IAgentParams);
```

## Properties

### params

```ts
params: IAgentParams
```

### _agentChangeSubject

```ts
_agentChangeSubject: Subject<unique symbol>
```

### _resqueSubject

```ts
_resqueSubject: Subject<unique symbol>
```

### _toolErrorSubject

```ts
_toolErrorSubject: Subject<unique symbol>
```

### _toolStopSubject

```ts
_toolStopSubject: Subject<unique symbol>
```

### _toolCommitSubject

```ts
_toolCommitSubject: Subject<void>
```

### _outputSubject

```ts
_outputSubject: Subject<string>
```

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes the incoming message and processes tool calls if any.
Queues the execution to prevent overlapping calls.

### run

```ts
run: (input: string) => Promise<string>
```

Runs the completion statelessly and returns the transformed output.
Queues the execution to prevent overlapping calls.

## Methods

### _emitOutput

```ts
_emitOutput(mode: ExecutionMode, rawResult: string): Promise<void>;
```

Emits the transformed output after validation, invoking callbacks and emitting events.
If validation fails, attempts to resurrect the model and revalidate.

### _resurrectModel

```ts
_resurrectModel(mode: ExecutionMode, reason?: string): Promise<string>;
```

Resurrects the model in case of failures by applying configured strategies (e.g., flush, recomplete, custom).
Updates the history and returns a placeholder or transformed result.

### waitForOutput

```ts
waitForOutput(): Promise<string>;
```

Waits for the output to be available and returns it.

### getCompletion

```ts
getCompletion(mode: ExecutionMode): Promise<IModelMessage>;
```

Retrieves a completion message from the model based on the current history and tools.
Handles validation and applies resurrection strategies if needed.

### commitUserMessage

```ts
commitUserMessage(message: string): Promise<void>;
```

Commits a user message to the history without triggering a response.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits a flush of the agent's history, clearing it and notifying the system.

### commitAgentChange

```ts
commitAgentChange(): Promise<void>;
```

Signals a change in the agent to halt subsequent tool executions.
Emits an event to notify the system.

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Signals a stop to prevent further tool executions.
Emits an event to notify the system.

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Commits a system message to the history and notifies the system.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Commits an assistant message to the history without triggering execution.

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits the tool output to the history and notifies the system.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the agent, performing cleanup and invoking the onDispose callback.
