---
title: docs/api-reference/interface/IAgentSchema
group: docs
---

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

### keepMessages

```ts
keepMessages: number
```

Optional maximum number of messages to maintain context size

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

### operator

```ts
operator: boolean
```

Flag means the operator is going to chat with customer on another side

### completion

```ts
completion: string
```

The name of the completion mechanism used by the agent. REQUIRED WHEN AGENT IS NOT OPERATOR

### prompt

```ts
prompt: string
```

The primary prompt guiding the agent's behavior. REQUIRED WHEN AGENT IS NOT OPERATOR

### system

```ts
system: string[]
```

Optional array of system prompts, typically used for tool-calling protocols.

### systemStatic

```ts
systemStatic: string[]
```

Optional array of system prompts, alias for `system`

### systemDynamic

```ts
systemDynamic: (clientId: string, agentName: string) => string[] | Promise<string[]>
```

Optional dynamic array of system prompts from the callback

### connectOperator

```ts
connectOperator: (clientId: string, agentName: string) => (message: string, next: (answer: string) => void) => DisposeFn$2
```

Operator connection function to passthrough the chat into operator dashboard

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

### wikiList

```ts
wikiList: string[]
```

Optional array of wiki names utilized by the agent.

### states

```ts
states: string[]
```

Optional array of state names managed by the agent.

### mcp

```ts
mcp: string[]
```

Optional array of mcp names managed by the agent

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
map: (message: IModelMessage<object>, clientId: string, agentName: string) => IModelMessage<object> | Promise<IModelMessage<object>>
```

Optional function to map assistant messages, e.g., converting JSON to tool calls for specific models.

### callbacks

```ts
callbacks: Partial<IAgentSchemaCallbacks>
```

Optional lifecycle callbacks for the agent, allowing customization of execution flow.
