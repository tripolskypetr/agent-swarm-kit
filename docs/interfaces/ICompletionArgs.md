# ICompletionArgs

Arguments required to get a completion.

## Properties

### clientId

```ts
clientId: string
```

Client ID.

### agentName

```ts
agentName: string
```

Name of the agent.

### mode

```ts
mode: ExecutionMode
```

The source of the last message: tool or user

### messages

```ts
messages: IModelMessage[]
```

Array of model messages.

### tools

```ts
tools: ITool[]
```

Optional array of tools.
