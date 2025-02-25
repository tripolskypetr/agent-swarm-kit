# IAgentParams

Interface representing the parameters for an agent.

## Properties

### clientId

```ts
clientId: string
```

The ID of the client.

### logger

```ts
logger: ILogger
```

The logger instance.

### bus

```ts
bus: IBus
```

The bus instance.

### history

```ts
history: IHistory
```

The history instance.

### completion

```ts
completion: ICompletion
```

The completion instance.

### tools

```ts
tools: IAgentTool<Record<string, unknown>>[]
```

The tools used by the agent.

### validate

```ts
validate: (output: string) => Promise<string>
```

Validates the output.
