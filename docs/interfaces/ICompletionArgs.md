# ICompletionArgs

Interface representing the arguments required to request a completion.
Encapsulates context and inputs for generating a model response.

## Properties

### clientId

```ts
clientId: string
```

The unique ID of the client requesting the completion.

### agentName

```ts
agentName: string
```

The unique name of the agent associated with the completion request.

### mode

```ts
mode: ExecutionMode
```

The source of the last message, indicating whether it originated from a tool or user.

### messages

```ts
messages: IModelMessage<object>[]
```

An array of model messages providing the conversation history or context for the completion.

### tools

```ts
tools: ITool[]
```

Optional array of tools available for the completion process (e.g., for tool calls).
