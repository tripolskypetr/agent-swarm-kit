---
title: docs/api-reference/interface/IAgentToolCallbacks
group: docs
---

# IAgentToolCallbacks

Interface representing lifecycle callbacks for an agent tool.
Provides hooks for pre- and post-execution, validation, and error handling.

## Properties

### onBeforeCall

```ts
onBeforeCall: (toolId: string, clientId: string, agentName: string, params: T) => Promise<void>
```

Optional callback triggered before the tool is executed.
Useful for logging, pre-processing, or setup tasks.

### onAfterCall

```ts
onAfterCall: (toolId: string, clientId: string, agentName: string, params: T) => Promise<void>
```

Optional callback triggered after the tool is executed.
Useful for cleanup, logging, or post-processing.

### onValidate

```ts
onValidate: (clientId: string, agentName: string, params: T) => Promise<boolean>
```

Optional callback triggered to validate tool parameters before execution.
Allows custom validation logic specific to the tool.

### onCallError

```ts
onCallError: (toolId: string, clientId: string, agentName: string, params: T, error: Error) => Promise<void>
```

Optional callback triggered when the tool execution fails.
Useful for error logging or recovery actions.
