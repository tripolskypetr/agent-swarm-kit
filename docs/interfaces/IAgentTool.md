# IAgentTool

Interface representing a tool used by an agent.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool.

### callbacks

```ts
callbacks: Partial<IAgentToolCallbacks<Record<string, unknown>>>
```

The name of the tool.

## Methods

### call

```ts
call: (clientId: string, agentName: string, params: T) => Promise<void>
```

Calls the tool with the specified parameters.

### validate

```ts
validate: (clientId: string, agentName: string, params: T) => boolean | Promise<boolean>
```

Validates the parameters for the tool.
