# IAgentToolCallbacks

Interface representing lifecycle callbacks of a tool

## Properties

### onBeforeCall

```ts
onBeforeCall: (toolId: string, clientId: string, agentName: string, params: T) => Promise<void>
```

Callback triggered before the tool is called.

### onAfterCall

```ts
onAfterCall: (toolId: string, clientId: string, agentName: string, params: T) => Promise<void>
```

Callback triggered after the tool is called.

### onValidate

```ts
onValidate: (clientId: string, agentName: string, params: T) => Promise<boolean>
```

Callback triggered when the tool parameters are validated.

### onCallError

```ts
onCallError: (toolId: string, clientId: string, agentName: string, params: T, error: Error) => Promise<void>
```

Callback triggered when the tool fails to execute
