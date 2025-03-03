# ClientAgent

Implements `IAgent`

Represents a client agent that interacts with the system.

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

### _toolErrorSubject

```ts
_toolErrorSubject: Subject<unique symbol>
```

### _toolCommitSubject

```ts
_toolCommitSubject: Subject<void>
```

### _outputSubject

```ts
_outputSubject: Subject<string>
```

### _emitOuput

```ts
_emitOuput: (mode: ExecutionMode, rawResult: string) => Promise<void>
```

Emits the output result after validation.

### _resurrectModel

```ts
_resurrectModel: (mode: ExecutionMode, reason?: string) => Promise<string>
```

Resurrects the model based on the given reason.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output to be available.

### getCompletion

```ts
getCompletion: (mode: ExecutionMode) => Promise<IModelMessage>
```

Gets the completion message from the model.

### commitUserMessage

```ts
commitUserMessage: (message: string) => Promise<void>
```

Commits a user message to the history without answer.

### commitFlush

```ts
commitFlush: () => Promise<void>
```

Commits flush of agent history

### commitAgentChange

```ts
commitAgentChange: () => Promise<void>
```

Commits change of agent to prevent the next tool execution from being called.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the history.

### commitToolOutput

```ts
commitToolOutput: (toolId: string, content: string) => Promise<void>
```

Commits the tool output to the history.

### execute

```ts
execute: (input: string, mode: ExecutionMode) => Promise<void>
```

Executes the incoming message and processes tool calls if any.

### dispose

```ts
dispose: () => Promise<void>
```

Should call on agent dispose
