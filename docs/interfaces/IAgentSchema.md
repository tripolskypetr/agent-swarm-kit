# IAgentSchema

Interface representing the configuration schema for an agent.
Defines the agent's properties, tools, and lifecycle behavior.

## Properties

### mapToolCalls

```ts
mapToolCalls: (tool: IToolCall[], clientId: string, agentName: string) => IToolCall[] | Promise<IToolCall[]>
```

Optional function to filter or modify tool calls before execution.

### maxToolCalls

```ts
maxToolCalls: number
```

Optional maximum number of tool calls allowed per completion cycle.

### docDescription

```ts
docDescription: string
```

Optional description for documentation purposes, aiding in agent usage understanding.

### agentName

```ts
agentName: string
```

The unique name of the agent within the swarm.

### completion

```ts
completion: string
```

The name of the completion mechanism used by the agent.

### prompt

```ts
prompt: string
```

The primary prompt guiding the agent's behavior.

### system

```ts
system: string[]
```

Optional array of system prompts, typically used for tool-calling protocols.

### tools

```ts
tools: string[]
```

Optional array of tool names available to the agent.

### storages

```ts
storages: string[]
```

Optional array of storage names utilized by the agent.

### states

```ts
states: string[]
```

Optional array of state names managed by the agent.

### dependsOn

```ts
dependsOn: string[]
```

Optional array of agent names this agent depends on for transitions (e.g., via changeToAgent).

### validate

```ts
validate: (output: string) => Promise<string>
```

Optional function to validate the agent's output before finalization.

### transform

```ts
transform: (input: string, clientId: string, agentName: string) => string | Promise<string>
```

Optional function to transform the model's output before further processing.

### map

```ts
map: (message: IModelMessage, clientId: string, agentName: string) => IModelMessage | Promise<IModelMessage>
```

Optional function to map assistant messages, e.g., converting JSON to tool calls for specific models.

### callbacks

```ts
callbacks: Partial<IAgentSchemaCallbacks>
```

Optional lifecycle callbacks for the agent, allowing customization of execution flow.
