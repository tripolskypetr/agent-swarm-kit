# ClientSession

Implements `ISession`

ClientSession class implements the ISession interface.

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

## Methods

### emit

```ts
emit(message: string): Promise<void>;
```

Emits a message.

### execute

```ts
execute(message: string, mode: ExecutionMode): Promise<string>;
```

Executes a message and optionally emits the output.

### run

```ts
run(message: string): Promise<string>;
```

Run the completion stateless

### commitToolOutput

```ts
commitToolOutput(toolId: string, content: string): Promise<void>;
```

Commits tool output.

### commitUserMessage

```ts
commitUserMessage(message: string): Promise<void>;
```

Commits user message without answer.

### commitFlush

```ts
commitFlush(): Promise<void>;
```

Commits flush of agent history

### commitStopTools

```ts
commitStopTools(): Promise<void>;
```

Commits stop of the nexttool execution

### commitSystemMessage

```ts
commitSystemMessage(message: string): Promise<void>;
```

Commits a system message.

### commitAssistantMessage

```ts
commitAssistantMessage(message: string): Promise<void>;
```

Commits an assistant message.

### connect

```ts
connect(connector: SendMessageFn$1): ReceiveMessageFn<string>;
```

Connects the session to a connector function.

### dispose

```ts
dispose(): Promise<void>;
```

Should call on session dispose
