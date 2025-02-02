# IAgentToolCallbacks

Interface representing lifecycle callbacks of a tool

## Properties

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
