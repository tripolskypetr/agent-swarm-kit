---
title: docs/api-reference/interface/ICommitActionParams
group: docs
---

# ICommitActionParams

Configuration parameters for creating a commit action handler (WRITE pattern).
Defines validation, action execution, and response messages for state-modifying operations.

## Properties

### validateParams

```ts
validateParams: (dto: { clientId: string; agentName: string; toolCalls: IToolCall[]; params: T; }) => string | Promise<string>
```

Optional function to validate action parameters.
Returns error message string if validation fails, null if valid.

### executeAction

```ts
executeAction: (params: T, clientId: string, agentName: string) => string | Promise<string>
```

Function to execute the actual action (e.g., commitAppAction).
Called only when parameters are valid and isLast is true.
Returns result string to commit as tool output.

### emptyContent

```ts
emptyContent: (params: T, clientId: string, agentName: string) => string | Promise<string>
```

Optional function to handle when executeAction returns empty result.
Returns message to commit as tool output.

### successMessage

```ts
successMessage: string | ((params: T, clientId: string, agentName: string) => string | Promise<string>)
```

Message to execute using executeForce after successful action execution.

### failureMessage

```ts
failureMessage: string | ((params: T, clientId: string, agentName: string) => string | Promise<string>)
```

Optional message to execute using executeForce when validation fails.
