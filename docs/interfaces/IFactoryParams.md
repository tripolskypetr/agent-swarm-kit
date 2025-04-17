---
title: docs/api-reference/interface/IFactoryParams
group: docs
---

# IFactoryParams

Configuration parameters for creating a navigation handler to a specific agent.
Defines optional messages or functions to handle flush, emission, execution, and tool output scenarios during navigation, incorporating the last user message where applicable.

## Properties

### flushMessage

```ts
flushMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

### toolOutput

```ts
toolOutput: string | ((clientId: string, agentName: string) => string | Promise<string>)
```

### emitMessage

```ts
emitMessage: string | ((clientId: string, lastMessage: string, agentName: string) => string | Promise<string>)
```

### executeMessage

```ts
executeMessage: string | ((clientId: string, lastMessage: string, agentName: string) => string | Promise<string>)
```
