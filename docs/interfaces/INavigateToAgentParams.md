---
title: docs/api-reference/interface/INavigateToAgentParams
group: docs
---

# INavigateToAgentParams

Configuration parameters for creating a navigation handler to a specific agent.
Defines optional messages or functions to handle flush, emission, execution, and tool output scenarios during navigation, incorporating the last user message where applicable.

## Properties

### beforeNavigate

```ts
beforeNavigate: (clientId: string, lastMessage: string, lastAgent: string, agentName: string) => void | Promise<void>
```

### flushMessage

```ts
flushMessage: string | ((clientId: string, defaultAgent: string) => string | Promise<string>)
```

### toolOutput

```ts
toolOutput: string | ((clientId: string, lastAgent: string, agentName: string) => string | Promise<string>)
```

### lastMessage

```ts
lastMessage: (clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>
```

### emitMessage

```ts
emitMessage: string | ((clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>)
```

### executeMessage

```ts
executeMessage: string | ((clientId: string, lastMessage: string, lastAgent: string, agentName: string) => string | Promise<string>)
```
