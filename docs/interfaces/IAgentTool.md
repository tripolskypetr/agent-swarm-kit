# IAgentTool

Interface representing a tool used by an agent.

## Properties

### docNote

```ts
docNote: string
```

The description for documentation

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
call: (dto: { toolId: string; clientId: string; agentName: string; params: T; toolCalls: IToolCall[]; isLast: boolean; }) => Promise<void>
```

Calls the tool with the specified parameters.

### validate

```ts
validate: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: T; }) => boolean | Promise<boolean>
```

Validates the parameters for the tool.
