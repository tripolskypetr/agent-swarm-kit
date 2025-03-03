# IAgentSchema

Interface representing the schema for an agent.

## Properties

### docDescription

```ts
docDescription: string
```

The description for documentation

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

### storages

```ts
storages: string[]
```

The names of the storages used by the agent.

### states

```ts
states: string[]
```

The names of the states used by the agent.

### dependsOn

```ts
dependsOn: string[]
```

The list of dependencies for changeAgent

### validate

```ts
validate: (output: string) => Promise<string>
```

Validates the output.

### transform

```ts
transform: (input: string, clientId: string, agentName: string) => string | Promise<string>
```

The transform function for model output

### map

```ts
map: (message: IModelMessage, clientId: string, agentName: string) => IModelMessage | Promise<IModelMessage>
```

The map function for assistant messages. Use to transform json to tool_call for deepseek r1 on ollama

### callbacks

```ts
callbacks: Partial<IAgentSchemaCallbacks>
```

The lifecycle calbacks of the agent.
