# IAgentParams

## Properties

### agentName

```ts
agentName: string
```

### clientId

```ts
clientId: string
```

### logger

```ts
logger: ILogger
```

### history

```ts
history: IHistory
```

### completion

```ts
completion: ICompletion
```

### tools

```ts
tools: IAgentTool<Record<string, unknown>>[]
```

### validate

```ts
validate: (output: string) => Promise<string>
```
