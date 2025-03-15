# ClientSession

Implements `ISession`

Represents a client session for managing message execution, emission, and agent interactions.

## Constructor

```ts
constructor(params: ISessionParams);
```

## Properties

### params

```ts
params: ISessionParams
```

### _emitSubject

```ts
_emitSubject: Subject<string>
```

Subject for emitting output messages to subscribers.

## Methods

### emit

```ts
emit(message: string): Promise<void>;
```

Emits a message to subscribers after validating it against the policy.
If validation fails, emits the ban message instead.

### execute

```ts
execute(message: string, mode: ExecutionMode): Promise<string>;
```

Executes a message using the swarm's agent and returns the output.
Validates input and output against the policy, returning a ban message if either fails.

### run

```ts
run(message: string): Promise<string>;
```

Runs a stateless completion of a message using the swarm's agent and returns the output.
Does not emit the result but logs the execution via the event bus.

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits tool output to the agent's history via the swarm.

### commitUserMessage

```ts
commitUserMessage(message: string): Promise<void>;
```

Commits a user message to the agent's history without triggering a response.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits a flush of the agent's history, clearing it.

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Signals the agent to stop the execution of subsequent tools.

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Commits a system message to the agent's history.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Commits an assistant message to the agent's history without triggering execution.

### connect

```ts
connect(connector: SendMessageFn$1): ReceiveMessageFn<string>;
```

Connects the session to a message connector, subscribing to emitted messages and returning a receiver function.

### dispose

```ts
dispose(): Promise<void>;
```

Disposes of the session, performing cleanup and invoking the onDispose callback if provided.
Should be called when the session is no longer needed.
