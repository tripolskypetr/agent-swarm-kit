# IAgentTool

Interface representing a tool used by an agent.

## Properties

### toolName

```ts
toolName: string
```

The name of the tool.

### onCall

```ts
onCall: (clientId: string, agentName: string, params: T) => Promise<void>
```

Callback triggered when the tool is called.

### onValidate

```ts
onValidate: (clientId: string, agentName: string, params: T) => Promise<boolean>
```

Callback triggered when the tool parameters are validated.

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
