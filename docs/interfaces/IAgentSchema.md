# IAgentSchema

Interface representing the schema for an agent.

## Properties

### agentName

```ts
agentName: string
```

The name of the agent.

### completion

```ts
completion: string
```

The name of the completion.

### prompt

```ts
prompt: string
```

The prompt for the agent.

### system

```ts
system: string[]
```

The system prompt. Usually used for tool calling protocol.

### tools

```ts
tools: string[]
```

The names of the tools used by the agent.

### validate

```ts
validate: (output: string) => Promise<string>
```

Validates the output.

### transform

```ts
transform: (input: string) => string
```

The transform function for model output

### callbacks

```ts
callbacks: Partial<IAgentSchemaCallbacks>
```

The lifecycle calbacks of the agent.
