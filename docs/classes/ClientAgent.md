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
_emitOuput: (result: string) => Promise<void>
```

Emits the output result after validation.

### _resurrectModel

```ts
_resurrectModel: (reason?: string) => Promise<string>
```

Resurrects the model based on the given reason.

### waitForOutput

```ts
waitForOutput: () => Promise<string>
```

Waits for the output to be available.

### getCompletion

```ts
getCompletion: () => Promise<IModelMessage>
```

Gets the completion message from the model.

### commitSystemMessage

```ts
commitSystemMessage: (message: string) => Promise<void>
```

Commits a system message to the history.

### commitToolOutput

```ts
commitToolOutput: (content: string) => Promise<void>
```

Commits the tool output to the history.

### execute

```ts
execute: (input: string) => Promise<void>
```

Executes the incoming message and processes tool calls if any.
