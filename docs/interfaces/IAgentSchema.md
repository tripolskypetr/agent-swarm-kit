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
